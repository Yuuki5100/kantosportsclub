import React, { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import AutoComplete from "@/components/base/Input/AutoComplete";
import PageContainer from "@base/Layout/PageContainer";
import { useFetch } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import colors from "@/styles/colors";

type NoticeCreateRequest = {
  title: string;
  station: string | null;
  locationId: number | null;
  dateandtime: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
  startHour: string | null;
  endHour: string | null;
  money: string | number | null;
};

type NoticeCreateState = {
  title: string;
  station: string;
  locationId: string;
  locationName: string;
  dateandtime: string;
  people: string;
  peopleName: string;
  remarks: string;
  publicAt: string;
  closedAt: string;
  startHour: string;
  endHour: string;
  money: string;
};

const INITIAL_STATE: NoticeCreateState = {
  title: "",
  station: "",
  locationId: "",
  locationName: "",
  dateandtime: "",
  people: "",
  peopleName: "",
  remarks: "",
  publicAt: "",
  closedAt: "",
  startHour: "",
  endHour: "",
  money: "",
};

const NoticeCreatePage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<NoticeCreateState>(INITIAL_STATE);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const {
    data: masterLocations,
    isLoading: isMasterLocationsLoading,
    isError: isMasterLocationsError,
  } = useFetch<{ locationId: number; locationName: string | null }[]>(
    "masterLocations",
    API_ENDPOINTS.MASTER_LOCATION.LIST,
    undefined,
    { useCache: true }
  );

  const locationOptions = (masterLocations ?? []).map((location) => ({
    label: location.locationName ?? "",
    value: String(location.locationId),
  }));

  const handleChange = useCallback(
    (field: keyof NoticeCreateState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleLocationChange = useCallback((option: { label: string; value: string } | null) => {
    setSelectedLocationId(option?.value ?? "");
    setForm((current) => ({
      ...current,
      locationId: option?.value ?? "",
      locationName: option?.label ?? "",
    }));
  }, []);

  const handleBack = useCallback(() => {
    void router.push("/admin/menu");
  }, [router]);

  const handleSave = useCallback(async () => {
    const title = form.title.trim();
    if (!title) {
      showSnackbar(getMessage(MessageCodes.ALL_FIELDS_REQUIRED), "ERROR");
      return;
    }

    setIsSaving(true);
    try {
      const payload: NoticeCreateRequest = {
        title,
        station: form.station.trim() ? form.station : null,
        locationId: form.locationId.trim() ? Number(form.locationId) : null,
        dateandtime: form.dateandtime.trim() ? form.dateandtime : null,
        people: form.people.trim() ? Number(form.people) : null,
        peopleName: form.peopleName.trim() ? form.peopleName : null,
        remarks: form.remarks.trim() ? form.remarks : null,
        publicAt: form.publicAt.trim() ? form.publicAt : null,
        closedAt: form.closedAt.trim() ? form.closedAt : null,
        startHour: form.startHour.trim() ? form.startHour : null,
        endHour: form.endHour.trim() ? form.endHour : null,
        money: form.money.trim() ? form.money : null,
      };

      const created = await apiService.post<{ noticeId: number }>(API_ENDPOINTS.NOTICE.CREATE, payload);
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "お知らせを追加"), "SUCCESS");
      void router.push({
        pathname: "/top-page/detail",
        query: { id: String(created.noticeId) },
      });
    } catch (error) {
      console.error("Create notice failed:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "お知らせの追加"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  }, [form, router, showSnackbar]);

  const fields: Array<{ label: string; field: keyof NoticeCreateState; multiline?: boolean }> = [
    { label: "タイトル", field: "title" },
    { label: "場所", field: "locationName" },
    { label: "開催日", field: "dateandtime" },
    { label: "開始時刻", field: "startHour" },
    { label: "終了時刻", field: "endHour" },
    { label: "最寄り駅", field: "station" },
    { label: "金額", field: "money" },
    { label: "人数", field: "people" },
    { label: "参加者", field: "peopleName" },
    { label: "備考", field: "remarks", multiline: true },
    { label: "公開日時", field: "publicAt" },
    { label: "終了日時", field: "closedAt" },
  ];

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Font20>お知らせ追加</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            必要な項目を入力してお知らせを登録します。
          </Font14>
        </Box>

        <Box
          sx={{
            width: "100%",
            border: `1.5px solid ${colors.commonBorderGray}`,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {fields.map((field, index) => (
            <Box
              key={field.label}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "180px minmax(0, 1fr)" },
                width: "100%",
                borderBottom: index === fields.length - 1 ? "none" : `1.5px solid ${colors.commonBorderGray}`,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  p: 1.5,
                  bgcolor: colors.commonTableHeader,
                  color: colors.commonFontColorBlack,
                  fontWeight: 600,
                }}
              >
                {field.label}
              </Box>
              <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
                {field.field === "locationName" ? (
                  <AutoComplete
                    name="noticeCreateLocation"
                    id="noticeCreateLocation"
                    options={locationOptions}
                    defaultValue={selectedLocationId || form.locationName || undefined}
                    disabled={isMasterLocationsLoading || isMasterLocationsError}
                    helperText={
                      isMasterLocationsError
                        ? "場所の取得に失敗しました。"
                        : isMasterLocationsLoading
                          ? "場所を読み込み中です。"
                          : undefined
                    }
                    error={isMasterLocationsError}
                    onChange={handleLocationChange}
                    customStyle={{ mt: 0 }}
                  />
                ) : (
                  <TextField
                    name={`noticeCreate${field.field}`}
                    value={form[field.field]}
                    size="small"
                    fullWidth
                    multiline={field.multiline}
                    minRows={field.multiline ? 3 : undefined}
                    onChange={handleChange(field.field)}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          <ButtonAction label={isSaving ? "登録中..." : "登録"} onClick={handleSave} disabled={isSaving} />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default NoticeCreatePage;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import apiClient from "@/api/apiClient";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { Box, Font14 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import AutoComplete from "@/components/base/Input/AutoComplete";
import DatePicker from "@/components/base/Input/DatePicker";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import { useFetch } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import type { NoticeDetailEditRequest, NoticeDetailResponse } from "@/types/notice";

type DetailField = {
  label: string;
  value: string;
};

type NoticeApiResponse = {
  id: number;
  title: string | null;
  station: string | null;
  locationId: number | null;
  locationName: string | null;
  dateandtime: string | null;
  people: number | null;
  peopleName: string | null;
  remarks: string | null;
  publicAt: string | null;
  closedAt: string | null;
  startHour: string | null;
  endHour: string | null;
  money: string | null;
};

const EMPTY_NOTICE: NoticeDetailResponse = {
  noticeId: 0,
  noticeTitle: "",
  startDate: "",
  endDate: "",
  contents: "",
  docIds: [],
  creatorUserName: "",
  createdAt: "",
  editorUserName: "",
  updatedAt: "",
};

type NoticeEditState = {
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

const NOTICE_DATE_FORMAT = "YYYY-MM-DD";
const NOTICE_PLACEHOLDERS = {
  title: "例: バスケ",
  station: "例: 横浜",
  locationName: "例: 横浜",
  dateandtime: "例: 2026-05-30",
  people: "例: 5",
  peopleName: "例: 和田、高村、後藤",
  remarks: "例: 持ち物を記載してください",
  publicAt: "例: 2026-05-01",
  closedAt: "例: 2026-05-31",
  startHour: "例: 10:00",
  endHour: "例: 16:00",
  money: "例: 660",
} as const;

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const normalizeNoticeResponse = (response: NoticeApiResponse): NoticeDetailResponse => ({
  noticeId: response.id,
  noticeTitle: response.title ?? "",
  station: response.station ?? "",
  locationId: response.locationId,
  locationName: response.locationName ?? "",
  dateandtime: response.dateandtime ?? "",
  people: response.people,
  peopleName: response.peopleName ?? "",
  remarks: response.remarks ?? "",
  publicAt: response.publicAt ?? "",
  closedAt: response.closedAt ?? "",
  startHour: response.startHour ?? "",
  endHour: response.endHour ?? "",
  money: response.money,
  startDate: "",
  endDate: "",
  contents: "",
  docIds: [],
  creatorUserName: "",
  createdAt: "",
  editorUserName: "",
  updatedAt: "",
});

const NoticeDetailPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { refreshAuth } = useAuth();
  const { canViewNotice, canEditNotice } = usePermission();
  const [notice, setNotice] = useState<NoticeDetailResponse>(EMPTY_NOTICE);
  const [editState, setEditState] = useState<NoticeEditState>({
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
  });
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const locationOptions = useMemo(
    () =>
      (masterLocations ?? []).map((location) => ({
        label: location.locationName ?? "",
        value: String(location.locationId),
      })),
    [masterLocations]
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refreshAuth(true);

    const noticeId = getQueryValue(router.query.id);
    if (!noticeId) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      void router.replace("/top-page");
      return;
    }

    const fetchNotice = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get<NoticeApiResponse>(API_ENDPOINTS.NOTICE.DETAIL, {
          params: { notice_id: noticeId },
        });
        const normalized = normalizeNoticeResponse(response.data);
        setNotice(normalized);
        const locationId =
          normalized.locationId === null || normalized.locationId === undefined
            ? ""
            : String(normalized.locationId);
        setEditState({
          title: normalized.noticeTitle ?? "",
          station: normalized.station ?? "",
          locationId,
          locationName: normalized.locationName ?? "",
          dateandtime: normalized.dateandtime ?? "",
          people:
            normalized.people === null || normalized.people === undefined
              ? ""
              : String(normalized.people),
          peopleName: normalized.peopleName ?? "",
          remarks: normalized.remarks ?? "",
          publicAt: normalized.publicAt ?? "",
          closedAt: normalized.closedAt ?? "",
          startHour: normalized.startHour ?? "",
          endHour: normalized.endHour ?? "",
          money:
            normalized.money === null || normalized.money === undefined
              ? ""
              : String(normalized.money),
        });
        setSelectedLocationId(locationId);
      } catch (error) {
        console.error("Failed to fetch notice detail:", error);
        showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "お知らせ詳細"), "ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNotice();
  }, [refreshAuth, router, showSnackbar]);

  const handleBack = useCallback(() => {
    void router.push("/top-page");
  }, [router]);

  const handleChange = useCallback(
    (field: keyof NoticeEditState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  useEffect(() => {
    if (selectedLocationId || !notice.locationName) {
      return;
    }

    const currentLocation = locationOptions.find((option) => option.label === notice.locationName);
    if (currentLocation) {
      setSelectedLocationId(currentLocation.value);
      setEditState((current) => ({
        ...current,
        locationId: currentLocation.value,
        locationName: currentLocation.label,
      }));
    }
  }, [locationOptions, notice.locationName, selectedLocationId]);

  const handleLocationChange = useCallback((option: { label: string; value: string } | null) => {
    setSelectedLocationId(option?.value ?? "");
    setEditState((current) => ({
      ...current,
      locationId: option?.value ?? "",
      locationName: option?.label ?? "",
    }));
  }, []);

  const handleDateChange = useCallback(
    (field: "publicAt" | "closedAt") => (newValue: Dayjs | undefined) => {
      setEditState((current) => ({
        ...current,
        [field]: newValue ? newValue.format(NOTICE_DATE_FORMAT) : "",
      }));
    },
    []
  );

  const handleUpdate = useCallback(async () => {
    if (!notice.noticeId) {
      showSnackbar(getMessage(MessageCodes.DATA_NOT_FOUND), "ERROR");
      return;
    }

    setIsUpdating(true);
    try {
      const payload: NoticeDetailEditRequest = {
        title: editState.title,
        station: editState.station.trim() ? editState.station : null,
        locationId: editState.locationId.trim() ? Number(editState.locationId) : null,
        dateandtime: editState.dateandtime.trim() ? editState.dateandtime : null,
        people: editState.people.trim() ? Number(editState.people) : null,
        peopleName: editState.peopleName.trim() ? editState.peopleName : null,
        remarks: editState.remarks.trim() ? editState.remarks : null,
        publicAt: editState.publicAt.trim() ? editState.publicAt : null,
        closedAt: editState.closedAt.trim() ? editState.closedAt : null,
        startHour: editState.startHour.trim() ? editState.startHour : null,
        endHour: editState.endHour.trim() ? editState.endHour : null,
        money: editState.money.trim() ? editState.money : null,
      };

      const updated = await apiService.put<NoticeApiResponse>(
        `${API_ENDPOINTS.NOTICE.DETAIL}?notice_id=${notice.noticeId}`,
        payload
      );
      const normalized = normalizeNoticeResponse(updated);
      setNotice(normalized);
      setEditState({
        title: normalized.noticeTitle ?? "",
        station: normalized.station ?? "",
        locationId: normalized.locationId === null || normalized.locationId === undefined ? "" : String(normalized.locationId),
        locationName: normalized.locationName ?? "",
        dateandtime: normalized.dateandtime ?? "",
        people: normalized.people === null || normalized.people === undefined ? "" : String(normalized.people),
        peopleName: normalized.peopleName ?? "",
        remarks: normalized.remarks ?? "",
        publicAt: normalized.publicAt ?? "",
        closedAt: normalized.closedAt ?? "",
        startHour: normalized.startHour ?? "",
        endHour: normalized.endHour ?? "",
        money: normalized.money === null || normalized.money === undefined ? "" : String(normalized.money),
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "お知らせを更新"), "SUCCESS");
    } catch (error) {
      console.error("Failed to update notice detail:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "お知らせの更新"), "ERROR");
    } finally {
      setIsUpdating(false);
    }
  }, [editState, notice.noticeId, showSnackbar]);

  const fields: DetailField[] = useMemo(
    () => [
      { label: "タイトル", value: notice.noticeTitle ?? "" },
      { label: "場所", value: notice.locationName ?? "" },
      { label: "開催日", value: notice.dateandtime ?? "" },
      { label: "開始時刻", value: notice.startHour ?? "" },
      { label: "終了時刻", value: notice.endHour ?? "" },
      { label: "最寄り駅", value: notice.station ?? "" },
      {
        label: "金額",
        value: notice.money === null || notice.money === undefined ? "" : String(notice.money),
      },
      { label: "人数", value: notice.people === null || notice.people === undefined ? "" : String(notice.people) },
      { label: "参加者", value: notice.peopleName ?? "" },
      { label: "備考", value: notice.remarks ?? "" },
      { label: "公開日時", value: notice.publicAt ?? "" },
      { label: "終了日時", value: notice.closedAt ?? "" },
    ],
    [notice]
  );

  const renderDisplayValue = useCallback((value: string) => {
    return (
      <Font14 sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: colors.commonFontColorBlack }}>
        {value || "-"}
      </Font14>
    );
  }, []);

  const canEditCurrentNotice = canViewNotice && canEditNotice;

  const renderInput = useCallback(
    (label: string) => {
      const sharedSx = {
        "& .MuiInputBase-input, & .MuiInputBase-inputMultiline": {
          fontSize: "14px",
        },
      };

      if (label === "場所") {
        return (
          <AutoComplete
            name="noticeLocation"
            id="noticeLocation"
            options={locationOptions}
            defaultValue={selectedLocationId || editState.locationName || undefined}
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
        );
      }

      if (label === "備考") {
        return (
          <TextField
            value={editState.remarks}
            onChange={handleChange("remarks")}
            size="small"
            fullWidth
            multiline
            minRows={3}
            sx={sharedSx}
          />
        );
      }

      if (label === "開催日") {
        return (
          <TextField
            value={editState.dateandtime}
            onChange={handleChange("dateandtime")}
            size="small"
            fullWidth
            sx={sharedSx}
            placeholder="例: 2026-05-30"
          />
        );
      }

      if (label === "公開日時") {
        return (
          <DatePicker
            label={label}
            value={editState.publicAt ? dayjs(editState.publicAt, NOTICE_DATE_FORMAT) : null}
            onChange={handleDateChange("publicAt")}
            placeholder={NOTICE_PLACEHOLDERS.publicAt}
            showTime
            format="YYYY/MM/DD HH:mm"
            customStyle={{ mt: 0 }}
          />
        );
      }

      if (label === "終了日時") {
        return (
          <DatePicker
            label={label}
            value={editState.closedAt ? dayjs(editState.closedAt, NOTICE_DATE_FORMAT) : null}
            onChange={handleDateChange("closedAt")}
            placeholder={NOTICE_PLACEHOLDERS.closedAt}
            showTime
            format="YYYY/MM/DD HH:mm"
            customStyle={{ mt: 0 }}
          />
        );
      }

      return (
        <TextField
          value={
            {
              タイトル: editState.title,
              最寄り駅: editState.station,
              場所: editState.locationName,
              dateandtime: editState.dateandtime,
              人数: editState.people,
              参加者: editState.peopleName,
              備考: editState.remarks,
              公開日時: editState.publicAt,
              終了日時: editState.closedAt,
              開始時刻: editState.startHour,
              終了時刻: editState.endHour,
              金額: editState.money,
            }[label] ?? ""
          }
          onChange={handleChange(
            {
              タイトル: "title",
              最寄り駅: "station",
              場所: "locationName",
              dateandtime: "dateandtime",
              人数: "people",
              参加者: "peopleName",
              備考: "remarks",
              公開日時: "publicAt",
              終了日時: "closedAt",
              開始時刻: "startHour",
              終了時刻: "endHour",
              金額: "money",
            }[label] as keyof NoticeEditState
          )}
          size="small"
          fullWidth
          sx={sharedSx}
          placeholder={
            {
              タイトル: NOTICE_PLACEHOLDERS.title,
              最寄り駅: NOTICE_PLACEHOLDERS.station,
              場所: NOTICE_PLACEHOLDERS.locationName,
              dateandtime: NOTICE_PLACEHOLDERS.dateandtime,
              人数: NOTICE_PLACEHOLDERS.people,
              参加者: NOTICE_PLACEHOLDERS.peopleName,
              備考: NOTICE_PLACEHOLDERS.remarks,
              開始時刻: NOTICE_PLACEHOLDERS.startHour,
              終了時刻: NOTICE_PLACEHOLDERS.endHour,
              金額: NOTICE_PLACEHOLDERS.money,
            }[label] ?? undefined
          }
        />
      );
    },
    [
      editState.closedAt,
      editState.dateandtime,
      editState.endHour,
      editState.locationName,
      editState.money,
      editState.people,
      editState.peopleName,
      editState.publicAt,
      editState.remarks,
      editState.startHour,
      editState.station,
      editState.title,
      handleChange,
      handleLocationChange,
      isMasterLocationsError,
      isMasterLocationsLoading,
      locationOptions,
      selectedLocationId,
    ]
  );

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 60px, 1200px)", maxWidth: "100%", mx: "auto", gap: 2 }}>
        <Box sx={{ width: "100%", gap: 0.5 }}>
          <Font14 sx={{ color: colors.commonFontColorBlack, fontWeight: 700 }}>
            お知らせ詳細
          </Font14>
          <Font14 sx={{ color: colors.grayDark }}>
            {isLoading ? "読み込み中です。" : "一覧から選択したお知らせの詳細"}
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
                borderBottom:
                  index === fields.length - 1 ? "none" : `1.5px solid ${colors.commonBorderGray}`,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  p: 1.5,
                  bgcolor: colors.commonTableHeader,
                  color: colors.commonFontColorBlack,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {field.label}
              </Box>
              <Box sx={{ width: "100%", minWidth: 0, p: 1.5 }}>
                {field.label === "ID"
                  ? renderDisplayValue(field.value)
                  : canEditCurrentNotice
                    ? renderInput(field.label)
                    : renderDisplayValue(field.value)}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ width: "100%", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
          <ButtonAction label="戻る" color="secondary" onClick={handleBack} />
          {canEditCurrentNotice ? (
            <ButtonAction
              label={isUpdating ? "更新中..." : "更新"}
              onClick={handleUpdate}
              disabled={isUpdating || !notice.noticeId}
            />
          ) : null}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default NoticeDetailPage;

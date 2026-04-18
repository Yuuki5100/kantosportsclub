import React, { useState, useEffect, useCallback } from "react";
import ListView, {
  ColumnDefinition,
  RowDefinition,
} from "@/components/composite/Listview/ListView";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import RadioButton from "@/components/base/Input/RadioButton";
import colors from "@/styles/colors";
import ButtonAction from "@/components/base/Button/ButtonAction";
import CheckBox from "@/components/base/Input/CheckBox";
import ManualDetailPopup, {
  ManualDetail,
  ManualCreateData,
  ManualPopupMode,
} from "../detail";
import { createManualApi, getManualListApi, updateManualApi, deleteManualApi } from "@/api/services/v1/manualService";
import { ManualListItem } from "@/types/manual";
import { usePermission } from "@/hooks/usePermission";

const TARGET_MAP: Record<string, number> = {
  all: 0,
  generalUser: 1,
  systemAdmin: 2,
};

const DELETED_MAP: Record<string, number> = {
  hide: 1,
  show: 0,
};

const targetOptions = [
  { value: "all", label: "全て" },
  { value: "generalUser", label: "一般ユーザー向けのみ" },
  { value: "systemAdmin", label: "システム管理者向けのみ" },
];

const deletedOptions = [
  { value: "hide", label: "表示しない" },
  { value: "show", label: "表示する" },
];

const columns: ColumnDefinition[] = [
  { id: "index", label: "#", display: true, sortable: false, align: "center", widthPercent: 4 },
  { id: "title", label: "タイトル", display: true, sortable: true, align: "center", widthPercent: 25 },
  { id: "forGeneralUser", label: "一般ユーザー向け", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "forSystemAdmin", label: "システム管理者向け", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "updater", label: "更新者", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "updateDate", label: "更新日時", display: true, sortable: true, align: "center", widthPercent: 18 },
  { id: "detail", label: "詳細", display: true, sortable: false, align: "center", widthPercent: 8 },
];

const ManualListPage: React.FC = () => {
  const { canEditManual } = usePermission();
  const [searchTitle, setSearchTitle] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [deletedFilter, setDeletedFilter] = useState("hide");
  const [manuals, setManuals] = useState<ManualListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<ManualPopupMode>("detail");
  const [selectedManual, setSelectedManual] = useState<ManualDetail | null>(null);

  const fetchManuals = useCallback(async (pageNum: number, pageSz: number) => {
    try {
      const data = await getManualListApi({
        titleName: searchTitle || undefined,
        target: TARGET_MAP[targetFilter] ?? 0,
        isdeleted: DELETED_MAP[deletedFilter] ?? 0,
        pageNumber: pageNum,
        pagesize: pageSz,
      });
      setManuals(data.manuals ?? []);
      setTotalCount(data.total);
    } catch (error) {
      console.error("Failed to fetch manuals:", error);
    }
  }, [searchTitle, targetFilter, deletedFilter]);

  useEffect(() => {
    fetchManuals(page, pageSize);
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchManuals(1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchManuals(newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    fetchManuals(1, newPageSize);
  };

  const handleNewManual = () => {
    setPopupMode("create");
    setSelectedManual(null);
    setPopupOpen(true);
  };

  const handleDetailClick = (manual: ManualListItem) => {
    setPopupMode("detail");
    setSelectedManual({
      id: manual.manualId,
      title: "",
      targetUsers: [],
      description: "",
      attachments: [],
    });
    setPopupOpen(true);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
    setSelectedManual(null);
  };

  const handleCreate = async (data: ManualCreateData) => {
    try {
      const docIds = data.attachments.map((a) => a.fileId);
      await createManualApi({
        manualTitle: data.title,
        description: data.description,
        generalUser: data.targetUsers.includes("generalUser"),
        systemUser: data.targetUsers.includes("systemAdmin"),
        docIds,
      });
      setPopupOpen(false);
      fetchManuals(page, pageSize);
    } catch (error) {
      console.error("Create manual failed:", error);
    }
  };

  const handleUpdate = async (data: ManualDetail) => {
    try {
      const docIds = data.attachments.map((a) => a.fileId);
      await updateManualApi(data.id, {
        manualTitle: data.title,
        description: data.description,
        generalUser: data.targetUsers.includes("generalUser"),
        systemUser: data.targetUsers.includes("systemAdmin"),
        docIds,
      });
      setPopupOpen(false);
      fetchManuals(page, pageSize);
    } catch (error) {
      console.error("Update manual failed:", error);
    }
  };

  const handleDelete = async (manualId: number) => {
    try {
      await deleteManualApi(manualId);
      setPopupOpen(false);
      fetchManuals(page, pageSize);
    } catch (error) {
      console.error("Delete manual failed:", error);
    }
  };

  const rowData: RowDefinition[] = manuals.map((manual, index) => ({
    cells: [
      { id: `index-${manual.manualId}`, columnId: "index", cell: (page - 1) * pageSize + index + 1, value: (page - 1) * pageSize + index + 1 },
      { id: `title-${manual.manualId}`, columnId: "title", cell: manual.manualTitle, value: manual.manualTitle },
      {
        id: `forGeneralUser-${manual.manualId}`,
        columnId: "forGeneralUser",
        cell: (
          <CheckBox
            name={`forGeneralUser-${manual.manualId}`}
            options={[{ value: "checked", label: "" }]}
            selectedValues={manual.generalUser ? ["checked"] : []}
            onChange={() => {}}
            disabled={true}
          />
        ),
        value: manual.generalUser ? 1 : 0,
      },
      {
        id: `forSystemAdmin-${manual.manualId}`,
        columnId: "forSystemAdmin",
        cell: (
          <CheckBox
            name={`forSystemAdmin-${manual.manualId}`}
            options={[{ value: "checked", label: "" }]}
            selectedValues={manual.systemUser ? ["checked"] : []}
            onChange={() => {}}
            disabled={true}
          />
        ),
        value: manual.systemUser ? 1 : 0,
      },
      { id: `updater-${manual.manualId}`, columnId: "updater", cell: manual.updatedBy, value: manual.updatedBy },
      { id: `updateDate-${manual.manualId}`, columnId: "updateDate", cell: manual.updatedAt, value: manual.updatedAt },
      {
        id: `detail-${manual.manualId}`,
        columnId: "detail",
        cell: (
          <ButtonAction
            label="詳細"
            size="small"
            onClick={() => handleDetailClick(manual)}
            width={90}
            sx={{
              backgroundColor: "primary",
              color: "#ffffff",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "primary",
              },
            }}
          />
        ),
        value: "",
      },
    ],
  }));

  const searchElements = (
    <Box sx={{ p: 2, width: "100%", alignItems: "stretch" }}>
      <FormRow label="タイトル" labelAlignment="center" labelMinWidth="100px">
        <TextBox
          name="searchTitle"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </FormRow>

      <FormRow label="対象" labelAlignment="center" labelMinWidth="100px">
        <RadioButton
          name="targetFilter"
          options={targetOptions}
          selectedValue={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          direction="row"
        />
      </FormRow>

      <FormRow label="削除済" labelAlignment="center" labelMinWidth="100px">
        <RadioButton
          name="deletedFilter"
          options={deletedOptions}
          selectedValue={deletedFilter}
          onChange={(e) => setDeletedFilter(e.target.value)}
          direction="row"
        />
      </FormRow>

      <FlexBox mt={2} width="100%">
        <ButtonAction label="検索" onClick={handleSearch} />
      </FlexBox>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      {canEditManual && (
        <FlexBox justifyContent="flex-end" width="100%" mb={2}>
          <ButtonAction label="新規" onClick={handleNewManual} />
        </FlexBox>
      )}

      <ListView
        columns={columns}
        rowData={rowData}
        totalRowCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        searchOptions={{
          title: "検索オプション",
          elements: searchElements,
          accordionSx: { width: "100%" },
        }}
        sx={{
          width: "100%",
          "& .MuiTableHead-root .MuiTableCell-root": {
            backgroundColor: colors.commonTableHeader,
            color: colors.commonFontColorBlack,
            fontWeight: 600,
          },
          "& .MuiTableBody-root .MuiTableCell-root": {
            backgroundColor: colors.commonFontColorWhite,
            color: colors.commonFontColorBlack,
            borderBottom: `1.5px solid ${colors.commonBorderGray}`,
          },
          "& .MuiTableRow-root:hover .MuiTableCell-root": {
            backgroundColor: colors.commonTableHover,
          },
        }}
      />

      <ManualDetailPopup
        open={popupOpen}
        onClose={handlePopupClose}
        mode={popupMode}
        manual={selectedManual}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default ManualListPage;

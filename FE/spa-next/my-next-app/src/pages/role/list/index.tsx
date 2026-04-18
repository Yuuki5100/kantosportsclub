import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import ListView, {
  ColumnDefinition,
  RowDefinition,
} from "@/components/composite/Listview/ListView";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import RadioButton from "@/components/base/Input/RadioButton";
import ButtonAction from "@/components/base/Button/ButtonAction";
import colors from "@/styles/colors";
import { getRoleListApi } from "@/api/services/v1/roleService";
import { RoleListItem } from "@/types/role";
import { useSnackbar } from "@/hooks/useSnackbar";
import { usePermission } from "@/hooks/usePermission";
import { getMessage, MessageCodes } from "@/message";

const deletedOptions = [
  { value: "hide", label: "表示しない" },
  { value: "show", label: "表示する" },
];

const columns: ColumnDefinition[] = [
  { id: "index", label: "#", display: true, sortable: false, align: "center", widthPercent: 5 },
  { id: "roleId", label: "ロールID", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "roleName", label: "ロール名", display: true, sortable: true, align: "center", widthPercent: 25 },
  { id: "description", label: "説明", display: true, sortable: true, align: "center", widthPercent: 30 },
  { id: "updateDate", label: "更新日時", display: true, sortable: true, align: "center", widthPercent: 20 },
  { id: "detail", label: "詳細", display: true, sortable: false, align: "center", widthPercent: 10 },
];

const formatDateTime = (value: string | null): string => {
  if (!value) return "";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY/MM/DD HH:mm:ss") : "";
};

const RoleListPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { canEditRole } = usePermission();

  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchName, setSearchName] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("hide");

  const fetchRoles = useCallback(async (
    pageNum: number,
    pageSz: number,
    name?: string,
    isDeleted?: boolean,
  ) => {
    try {
      const data = await getRoleListApi({
        pageNumber: pageNum,
        pagesize: pageSz,
        name: name || undefined,
        isDeleted,
      });
      setRoles(data.roles);
      setTotalCount(data.total);
    } catch (error) {
      console.error("Failed to fetch role list:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "ロール一覧"), "ERROR");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRoles(page, pageSize, undefined, false);
  }, [fetchRoles]);

  const handleSearch = () => {
    setPage(1);
    const isDeleted = deletedFilter === "show" ? true : false;
    fetchRoles(1, pageSize, searchName || undefined, isDeleted);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const isDeleted = deletedFilter === "show" ? true : false;
    fetchRoles(newPage, pageSize, searchName || undefined, isDeleted);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    const isDeleted = deletedFilter === "show" ? true : false;
    fetchRoles(1, newPageSize, searchName || undefined, isDeleted);
  };

  const handleNewRole = () => {
    router.push("/role/detail?mode=create");
  };

  const handleDetailClick = (roleId: number) => {
    router.push(`/role/detail?id=${roleId}`);
  };

  const rowData: RowDefinition[] = useMemo(
    () =>
      roles.map((role, index) => ({
        cells: [
          { id: `index-${role.roleId}`, columnId: "index", cell: (page - 1) * pageSize + index + 1, value: (page - 1) * pageSize + index + 1 },
          { id: `roleId-${role.roleId}`, columnId: "roleId", cell: role.roleId, value: role.roleId },
          { id: `roleName-${role.roleId}`, columnId: "roleName", cell: role.roleName, value: role.roleName },
          { id: `description-${role.roleId}`, columnId: "description", cell: role.description, value: role.description },
          { id: `updateDate-${role.roleId}`, columnId: "updateDate", cell: formatDateTime(role.updatedAt), value: role.updatedAt },
          {
            id: `detail-${role.roleId}`,
            columnId: "detail",
            cell: (
              <ButtonAction
                label="詳細"
                size="small"
                onClick={() => handleDetailClick(role.roleId)}
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
      })),
    [roles, page, pageSize]
  );

  const searchElements = (
    <Box sx={{ p: 2, width: "100%", alignItems: "stretch" }}>
      <FormRow label="ロール名" labelAlignment="center" labelMinWidth="100px">
        <TextBox
          name="searchName"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
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
      {canEditRole && (
        <FlexBox justifyContent="flex-end" width="100%" mb={2}>
          <ButtonAction label="新規" onClick={handleNewRole} />
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
    </Box>
  );
};

export default RoleListPage;

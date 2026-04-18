import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box, FlexBox } from "@/components/base/Box";
import FormRow from "@/components/base/Input/FormRow";
import TextBox from "@/components/base/Input/TextBox";
import DropBox from "@/components/base/Input/DropBox";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { ControllableListView } from "@/components/composite";
import { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import { TableState } from "@/components/composite/Listview/ControllableListView";
import colors from "@/styles/colors";
import { getUserListApi } from "@/api/services/v1/userService";
import { getRoleDropdownApi } from "@/api/services/v1/roleService";
import { UserListItem } from "@/types/userType";
import { OptionInfo } from "@/components/base/Input/OptionInfo";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

type SearchConditionForm = {
  userName: string;
  email: string;
  role: string;
  status: string;
};

const INITIAL_SEARCH_CONDITION: SearchConditionForm = {
  userName: "",
  email: "",
  role: "",
  status: "",
};

const DEFAULT_ROLE_OPTION: OptionInfo = { value: "", label: "選択してください" };
const DEFAULT_STATUS_OPTION: OptionInfo = { value: "", label: "選択してください" };

const columns: ColumnDefinition[] = [
  { id: "userId", label: "ユーザーID", display: true, sortable: true, align: "center", widthPercent: 15 },
  { id: "userName", label: "ユーザー名", display: true, sortable: true, align: "center", widthPercent: 20 },
  { id: "email", label: "メールアドレス", display: true, sortable: true, align: "center", widthPercent: 25 },
  { id: "role", label: "ロール", display: true, sortable: true, align: "center", widthPercent: 15 },
  { id: "status", label: "ステータス", display: true, sortable: true, align: "center", widthPercent: 15 },
  { id: "detail", label: "詳細", display: true, sortable: false, align: "center", widthPercent: 10 },
];

const UserListPage: React.FC = () => {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [roleOptions, setRoleOptions] = useState<OptionInfo[]>([DEFAULT_ROLE_OPTION]);
  const [statusOptions] = useState<OptionInfo[]>([DEFAULT_STATUS_OPTION]);

  const [searchCondition, setSearchCondition] = useState<SearchConditionForm>(INITIAL_SEARCH_CONDITION);
  const [appliedCondition, setAppliedCondition] = useState<SearchConditionForm>(INITIAL_SEARCH_CONDITION);

  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 50,
    sortParams: {
      sortColumn: "userId",
      sortOrder: "asc",
    },
  });

  const [rows, setRows] = useState<UserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUserList = useCallback(async (state: TableState, condition: SearchConditionForm) => {
    setLoading(true);
    try {
      const data = await getUserListApi({
        pageNumber: state.page,
        pagesize: state.rowsPerPage,
        name: condition.userName || undefined,
        roleId: condition.role ? Number(condition.role) : undefined,
      });
      setRows(data.users);
      setTotalCount(data.total);
    } catch (error) {
      console.error("Failed to fetch user list:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "ユーザー一覧"), "ERROR");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const fetchRoleDropdown = useCallback(async () => {
    try {
      const data = await getRoleDropdownApi();
      const options: OptionInfo[] = [
        DEFAULT_ROLE_OPTION,
        ...data.roles.map((role) => ({ value: String(role.roleId), label: role.roleName })),
      ];
      setRoleOptions(options);
    } catch (error) {
      console.error("Failed to fetch role options:", error);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, "ロール候補"), "ERROR");
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchRoleDropdown();
    fetchUserList(tableState, appliedCondition);
  }, [fetchRoleDropdown, fetchUserList]);

  const handleSearch = () => {
    const nextTableState = { ...tableState, page: 1 };
    setTableState(nextTableState);
    setAppliedCondition(searchCondition);
    fetchUserList(nextTableState, searchCondition);
  };

  const handleClear = () => {
    const cleared = { ...INITIAL_SEARCH_CONDITION };
    const nextTableState = { ...tableState, page: 1 };
    setSearchCondition(cleared);
    setAppliedCondition(cleared);
    setTableState(nextTableState);
    fetchUserList(nextTableState, cleared);
  };

  const handleTableStateChange = (state: TableState) => {
    setTableState(state);
    fetchUserList(state, appliedCondition);
  };

  const handleDetailClick = (userId: string) => {
    router.push(`/user/detail?id=${userId}`);
  };

  const rowData: RowDefinition[] = useMemo(
    () =>
      rows.map((user) => ({
        cells: [
          { id: `userId-${user.userId}`, columnId: "userId", cell: user.userId, value: user.userId },
          {
            id: `userName-${user.userId}`,
            columnId: "userName",
            cell: `${user.surname} ${user.givenName}`,
            value: `${user.surname} ${user.givenName}`,
          },
          { id: `email-${user.userId}`, columnId: "email", cell: user.email, value: user.email },
          { id: `role-${user.userId}`, columnId: "role", cell: user.roleName, value: user.roleName },
          {
            id: `status-${user.userId}`,
            columnId: "status",
            cell: user.isLocked ? "ロック中" : "有効",
            value: user.isLocked ? "ロック中" : "有効",
          },
          {
            id: `detail-${user.userId}`,
            columnId: "detail",
            cell: (
              <ButtonAction
                label="詳細"
                size="small"
                onClick={() => handleDetailClick(user.userId)}
                width={90}
                sx={{
                  backgroundColor: "primary",
                  color: "#ffffff",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  "&:hover": { backgroundColor: "primary" },
                }}
              />
            ),
            value: "",
          },
        ],
      })),
    [rows]
  );

  const searchElements = (
    <Box sx={{ p: 2, width: "100%", alignItems: "stretch" }}>
      <FormRow label="ユーザー名" labelAlignment="center" labelMinWidth="120px">
        <TextBox
          name="searchUserName"
          value={searchCondition.userName}
          onChange={(e) => setSearchCondition((prev) => ({ ...prev, userName: e.target.value }))}
        />
      </FormRow>

      <FormRow label="メールアドレス" labelAlignment="center" labelMinWidth="120px">
        <TextBox
          name="searchEmail"
          value={searchCondition.email}
          onChange={(e) => setSearchCondition((prev) => ({ ...prev, email: e.target.value }))}
        />
      </FormRow>

      <FormRow label="ロール" labelAlignment="center" labelMinWidth="120px">
        <DropBox
          name="searchRole"
          options={roleOptions}
          selectedValue={searchCondition.role}
          onChange={(e) => setSearchCondition((prev) => ({ ...prev, role: e.target.value }))}
        />
      </FormRow>

      <FormRow label="ステータス" labelAlignment="center" labelMinWidth="120px">
        <DropBox
          name="searchStatus"
          options={statusOptions}
          selectedValue={searchCondition.status}
          onChange={(e) => setSearchCondition((prev) => ({ ...prev, status: e.target.value }))}
        />
      </FormRow>

      <FlexBox mt={2} width="100%" gap={2}>
        <ButtonAction label="検索" onClick={handleSearch} />
        <ButtonAction label="クリア" onClick={handleClear} color="secondary" />
      </FlexBox>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      <ControllableListView
        page={tableState.page}
        sortParams={tableState.sortParams}
        rowsPerPage={tableState.rowsPerPage}
        rowData={rowData}
        totalRowCount={totalCount}
        columns={columns}
        onTableStateChange={handleTableStateChange}
        rowsPerPageOptions={[10, 20, 50]}
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
      {loading && (
        <Box sx={{ mt: 1, color: "text.secondary" }}>読み込み中...</Box>
      )}
    </Box>
  );
};

export default UserListPage;

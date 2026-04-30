import React, { useCallback, useMemo, useState } from "react";
import { Link, TextField } from "@mui/material";
import { Box, Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import FormRow from "@/components/base/Input/FormRow";
import PageContainer from "@base/Layout/PageContainer";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import { useFetch } from "@/hooks/useApi";
import colors from "@/styles/colors";
import type { ApiResponse } from "@/types/api";

const BOARDGAME_LIST_ENDPOINT = "/api/boardgames/search";

type BoardgameApiItem = {
  id?: number | string | null;
  boardgame_name?: string | null;
  boardgameName?: string | null;
  owner_name?: string | null;
  ownerName?: string | null;
  people_min?: number | string | null;
  peopleMin?: number | string | null;
  people_max?: number | string | null;
  peopleMax?: number | string | null;
  need_time?: number | string | null;
  needTime?: number | string | null;
  url_str?: string | null;
  urlStr?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
};

type BoardgameItem = {
  id: number;
  boardgameName: string;
  ownerName: string;
  peopleMin: number | null;
  peopleMax: number | null;
  needTime: number | null;
  urlStr: string;
  createdAt: string;
};

type BoardgameSearchCondition = {
  boardgameName: string;
  people: string;
  needTime: string;
  ownerName: string;
};

const INITIAL_SEARCH_CONDITION: BoardgameSearchCondition = {
  boardgameName: "",
  people: "",
  needTime: "",
  ownerName: "",
};

const columns: ColumnDefinition[] = [
  { id: "boardgameName", label: "ゲーム名", display: true, sortable: true, align: "left", widthPercent: 24 },
  { id: "peopleMin", label: "人数", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "needTime", label: "目安時間", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "ownerName", label: "所有者", display: true, sortable: true, align: "center", widthPercent: 12 },
  { id: "urlStr", label: "URL", display: true, sortable: true, align: "left", widthPercent: 22 },
];

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toText = (value: string | null | undefined): string => value ?? "";

const normalizeSearchText = (value: string): string => value.trim().toLowerCase();

const toBoardgameItem = (item: BoardgameApiItem, index: number): BoardgameItem => ({
  id: toNumber(item.id) ?? index + 1,
  boardgameName: toText(item.boardgameName ?? item.boardgame_name),
  ownerName: toText(item.ownerName ?? item.owner_name),
  peopleMin: toNumber(item.peopleMin ?? item.people_min),
  peopleMax: toNumber(item.peopleMax ?? item.people_max),
  needTime: toNumber(item.needTime ?? item.need_time),
  urlStr: toText(item.urlStr ?? item.url_str),
  createdAt: toText(item.createdAt ?? item.created_at),
});

const extractBoardgameItems = (
  response: BoardgameApiItem[] | ApiResponse<BoardgameApiItem[]> | null | undefined
): BoardgameItem[] => {
  const items = Array.isArray(response) ? response : response?.data;
  return (items ?? []).map(toBoardgameItem);
};

const toPeopleRange = (item: BoardgameItem): string => {
  if (item.peopleMin === null && item.peopleMax === null) {
    return "-";
  }
  if (item.peopleMin !== null && item.peopleMax !== null) {
    return `${item.peopleMin}〜${item.peopleMax}人`;
  }
  return `${item.peopleMin ?? item.peopleMax}人`;
};

const matchesPeople = (item: BoardgameItem, peopleCondition: string): boolean => {
  const normalized = peopleCondition.trim();
  if (!normalized) {
    return true;
  }

  const people = Number(normalized);
  if (Number.isFinite(people)) {
    if (item.peopleMin !== null && item.peopleMax !== null) {
      return item.peopleMin <= people && people <= item.peopleMax;
    }
    return item.peopleMin === people || item.peopleMax === people;
  }

  return toPeopleRange(item).includes(normalized);
};

const toNeedTimeLabel = (needTime: number | null): string => {
  if (needTime === null) {
    return "-";
  }
  return `${needTime}分`;
};

const toLinkHref = (url: string): string => {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith("/")) {
    return url;
  }
  return `https://${url}`;
};

const createCell = (
  columnId: string,
  rowId: number,
  cell: React.ReactNode,
  value: string | number
) => ({
  id: `${columnId}-${rowId}`,
  columnId,
  cell,
  value,
});

const createUrlCell = (item: BoardgameItem) => {
  const value = item.urlStr.trim();

  return createCell(
    "urlStr",
    item.id,
    value ? (
      <Link
        href={toLinkHref(value)}
        target="_blank"
        rel="noopener noreferrer"
        title={value}
        onClick={(event) => event.stopPropagation()}
        sx={{
          display: "block",
          maxWidth: "100%",
          color: colors.primary,
          textDecoration: "underline",
          overflowWrap: "anywhere",
          wordBreak: "break-all",
          "&:hover": {
            textDecoration: "none",
          },
        }}
      >
        {value}
      </Link>
    ) : (
      "-"
    ),
    value
  );
};

const getBoardgameSortValue = (item: BoardgameItem, columnId: string): string | number => {
  const value = item[columnId as keyof BoardgameItem];

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  return "";
};

const sortBoardgameItems = (
  items: BoardgameItem[],
  sortParams: TableState["sortParams"]
): BoardgameItem[] => {
  const { sortColumn, sortOrder } = sortParams;
  if (!sortColumn || sortOrder === false) {
    return items;
  }

  return [...items].sort((a, b) => {
    const aValue = getBoardgameSortValue(a, sortColumn);
    const bValue = getBoardgameSortValue(b, sortColumn);
    const direction = sortOrder === "asc" ? 1 : -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction;
    }

    return String(aValue).localeCompare(String(bValue), "ja", { numeric: true }) * direction;
  });
};

const BoardgamePage: React.FC = () => {
  const [searchCondition, setSearchCondition] = useState<BoardgameSearchCondition>(
    INITIAL_SEARCH_CONDITION
  );
  const [appliedSearchCondition, setAppliedSearchCondition] =
    useState<BoardgameSearchCondition>(INITIAL_SEARCH_CONDITION);
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 10,
    sortParams: {
      sortColumn: "",
      sortOrder: false,
    },
  });

  const searchParams = useMemo(() => {
    const params: Record<string, string> = {};

    const boardgameName = appliedSearchCondition.boardgameName.trim();
    const people = appliedSearchCondition.people.trim();
    const needTime = appliedSearchCondition.needTime.trim();
    const ownerName = appliedSearchCondition.ownerName.trim();

    if (boardgameName) params.boardgameName = boardgameName;
    if (people) params.people = people;
    if (needTime) params.needTime = needTime;
    if (ownerName) params.ownerName = ownerName;

    return Object.keys(params).length > 0 ? params : undefined;
  }, [appliedSearchCondition]);


  const { data, isLoading, isError, error } = useFetch<
    BoardgameApiItem[] | ApiResponse<BoardgameApiItem[]>
  >("boardgames", BOARDGAME_LIST_ENDPOINT, searchParams);

  const boardgames = useMemo(() => extractBoardgameItems(data), [data]);
  const sortedBoardgames = useMemo(
    () => sortBoardgameItems(boardgames, tableState.sortParams),
    [boardgames, tableState.sortParams]
  );
  const paginatedBoardgames = useMemo(() => {
    const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
    return sortedBoardgames.slice(startIndex, startIndex + tableState.rowsPerPage);
  }, [sortedBoardgames, tableState.page, tableState.rowsPerPage]);

  const rowData: RowDefinition[] = useMemo(
    () =>
      paginatedBoardgames.map((item) => ({
        cells: [
          createCell("id", item.id, item.id, item.id),
          createCell("boardgameName", item.id, item.boardgameName || "-", item.boardgameName),
          createCell("ownerName", item.id, item.ownerName || "-", item.ownerName),
          createCell("peopleMin", item.id, toPeopleRange(item), item.peopleMin ?? 0),
          createCell("needTime", item.id, toNeedTimeLabel(item.needTime), item.needTime ?? 0),
          createUrlCell(item),
          createCell("createdAt", item.id, item.createdAt || "-", item.createdAt),
        ],
      })),
    [paginatedBoardgames]
  );

  const handleSearchChange = useCallback(
    (field: keyof BoardgameSearchCondition) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchCondition((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    setTableState((current) => ({ ...current, page: 1 }));
    setAppliedSearchCondition(searchCondition);
  }, [searchCondition]);

  const handleClear = useCallback(() => {
    setSearchCondition(INITIAL_SEARCH_CONDITION);
    setAppliedSearchCondition(INITIAL_SEARCH_CONDITION);
    setTableState((current) => ({ ...current, page: 1 }));
  }, []);

  const searchElements = (
    <Box
      sx={{ p: 2, width: "100%", gap: 1 }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <FormRow label="ゲーム名" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="boardgameName"
          value={searchCondition.boardgameName}
          size="small"
          fullWidth
          onChange={handleSearchChange("boardgameName")}
        />
      </FormRow>

      <FormRow label="人数" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="boardgamePeople"
          value={searchCondition.people}
          size="small"
          fullWidth
          inputProps={{ inputMode: "numeric" }}
          onChange={handleSearchChange("people")}
        />
      </FormRow>

      <FormRow label="目安時間" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="boardgameNeedTime"
          value={searchCondition.needTime}
          size="small"
          fullWidth
          inputProps={{ inputMode: "numeric" }}
          onChange={handleSearchChange("needTime")}
        />
      </FormRow>

      <FormRow label="所有者" labelAlignment="center" labelMinWidth="120px">
        <TextField
          name="boardgameOwnerName"
          value={searchCondition.ownerName}
          size="small"
          fullWidth
          onChange={handleSearchChange("ownerName")}
        />
      </FormRow>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          width: "100%",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <ButtonAction label="検索" onClick={handleSearch} />
        <ButtonAction label="クリア" color="secondary" onClick={handleClear} />
        <Font14 sx={{ color: colors.grayDark }}>
          {isLoading
            ? "読み込み中です。"
            : `${boardgames.length} 件のデータを表示しています。`}
        </Font14>
      </Box>
    </Box>
  );

  return (
    <PageContainer>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Font20>ボードゲーム一覧</Font20>
          <Font14 sx={{ color: colors.grayDark, mt: 0.5 }}>
            API: {BOARDGAME_LIST_ENDPOINT}
          </Font14>
        </Box>

        {isError ? (
          <Box sx={{ color: colors.Red }}>
            データの取得に失敗しました。{error?.message ? `(${error.message})` : ""}
          </Box>
        ) : (
          <>
            <ControllableListView
              page={tableState.page}
              sortParams={tableState.sortParams}
              rowsPerPage={tableState.rowsPerPage}
              onTableStateChange={setTableState}
              rowsPerPageOptions={[10, 20, 50]}
              topPaginationHidden={false}
              rowData={rowData}
              totalRowCount={boardgames.length}
              columns={columns}
              searchOptions={{
                title: "検索条件",
                elements: searchElements,
                accordionSx: { width: "100%" },
              }}
              sx={{
                width: "100%",
                tableLayout: "fixed",
                "& table": {
                  tableLayout: "fixed",
                  width: "100%",
                },
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
              }}
            />
            {isLoading && (
              <Box sx={{ color: colors.grayDark }}>
                読み込み中...
              </Box>
            )}
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default BoardgamePage;

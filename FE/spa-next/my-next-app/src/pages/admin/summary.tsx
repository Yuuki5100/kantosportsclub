import React, { useMemo, useState } from "react";
import { Box, Font14, Font20 } from "@/components/base";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";
import type { SearchDefinition } from "@/components/composite/Listview/ListView";

const activityData = [
    { year: "2023", date: "2/23", title: "グループ結成", detail: "初期メンバー：太一、せいや、そうり、和田くん" },
    { year: "2023", date: "3/31", title: "グループ名（仮）", detail: "グループ名「関東でもバスケしたいです」" },
    { year: "2023", date: "3/9", title: "たかふみ加入", detail: "4名 → 5名" },
    { year: "2023", date: "3/10", title: "かつき加入、大澤くん加入", detail: "5名 → 7名" },
    { year: "2023", date: "5/23", title: "たかふみ脱退", detail: "8名 → 7名" },
    { year: "2023", date: "6/7", title: "おりぽん加入", detail: "7名 → 8名" },
    { year: "2023", date: "6/17", title: "モルック初体験", detail: "モルックが面白かったため、しばらくバスケ＋モルックの流れが定着する" },
    { year: "2023", date: "9/24", title: "シノン加入", detail: "8名 → 9名" },
    { year: "2023", date: "11/25", title: "ボドゲカフェにてボドゲを体験", detail: "バスケ以外の活動としてボドゲが定着するきっかけになった" },
    { year: "2023", date: "12/16", title: "1年目の忘年会開催", detail: "" },
    { year: "2024", date: "1/20", title: "会議室を初レンタル", detail: "会議室を借りてボドゲメインで遊ぶ。このタイミングでバスケとボドゲを別日に分けて遊ぶようになる" },
    { year: "2024", date: "7/24", title: "「関東スポクラ会」に改名", detail: "室内でバスケをするため、団体登録をし抽選参加するようになる" },
    { year: "2024", date: "12/14", title: "2年目の忘年会開催＋初めて体育館が当選する", detail: "東山田スポーツ会館の抽選に初当選" },
    { year: "2025", date: "2/16", title: "たかふみ復帰", detail: "9名 → 10名" },
    { year: "2025", date: "3/8", title: "神奈川スポーツ会館のレンタル成功", detail: "バスケ＋ボドゲの流れがより定着するようになる" },
    { year: "2025", date: "3/9", title: "ユニフォーム作成チーム結成", detail: "太一、和田くん、高村くん、せいや" },
    { year: "2025", date: "3/12", title: "グループのアイコンが完成する", detail: "" },
    { year: "2025", date: "3/18", title: "ユニフォームのデザイン決定", detail: "" },
    { year: "2025", date: "5/3", title: "ユニフォーム完成", detail: "以降のバスケではユニフォーム着用するようになる" },
    { year: "2025", date: "5/24", title: "「SUPOKURA」に改名", detail: "ユニフォームにも「SUPOKURA」が印字されている" },
    { year: "2025", date: "7/5", title: "バスケの試合を撮影するようになる", detail: "動画共有用として運営するようになる" },
    { year: "2025", date: "9/21", title: "ゆう加入", detail: "10名 → 11名" },
    { year: "2025", date: "12/14", title: "3年目の忘年会開催", detail: "" },
    { year: "2026", date: "1/24", title: "生太加入", detail: "11名 → 12名" },
    { year: "2026", date: "3/21", title: "あべちゃん加入", detail: "12名 → 13名" },
];

type ActivityItem = {
    year: string;
    date: string;
    title: string;
    detail: string;
};

const columns: ColumnDefinition[] = [
    { id: "year", label: "年", display: true, sortable: true, align: "center", widthPercent: 12 },
    { id: "date", label: "日付", display: true, sortable: true, align: "center", widthPercent: 12 },
    { id: "title", label: "タイトル", display: true, sortable: false, align: "left", widthPercent: 32 },
    { id: "detail", label: "詳細", display: true, sortable: false, align: "left", widthPercent: 44 },
];

const parseYear = (value: string): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const parseMonthDay = (value: string): number => {
    const [monthText, dayText] = value.split("/");
    const month = Number(monthText);
    const day = Number(dayText);
    if (!Number.isInteger(month) || !Number.isInteger(day)) {
        return Number.MAX_SAFE_INTEGER;
    }
    return month * 100 + day;
};

const createCell = (
    columnId: string,
    rowId: string,
    cell: React.ReactNode,
    value: string | number
) => ({
    id: `${columnId}-${rowId}`,
    columnId,
    cell,
    value,
});

const toActivityItems = (items: typeof activityData): ActivityItem[] => items;

const sortActivityItems = (items: ActivityItem[], sortParams: TableState["sortParams"]): ActivityItem[] => {
    const { sortColumn, sortOrder } = sortParams;
    if (!sortColumn || sortOrder === false) {
        return items;
    }

    const direction = sortOrder === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
        if (sortColumn === "date") {
            const dateDiff = parseMonthDay(a.date) - parseMonthDay(b.date);
            if (dateDiff !== 0) {
                return dateDiff * direction;
            }
            return (parseYear(a.year) - parseYear(b.year)) * direction;
        }

        const yearDiff = parseYear(a.year) - parseYear(b.year);
        if (yearDiff !== 0) {
            return yearDiff * direction;
        }
        return (parseMonthDay(a.date) - parseMonthDay(b.date)) * direction;
    });
};

const SummaryPage: React.FC = () => {
    const [tableState, setTableState] = useState<TableState>({
        page: 1,
        rowsPerPage: 10,
        sortParams: {
            sortColumn: "year",
            sortOrder: "asc",
        },
    });

    const activityItems = useMemo(() => toActivityItems(activityData), []);
    const sortedItems = useMemo(
        () => sortActivityItems(activityItems, tableState.sortParams),
        [activityItems, tableState.sortParams]
    );
    const paginatedItems = useMemo(() => {
        const startIndex = (tableState.page - 1) * tableState.rowsPerPage;
        return sortedItems.slice(startIndex, startIndex + tableState.rowsPerPage);
    }, [sortedItems, tableState.page, tableState.rowsPerPage]);

    const rowData: RowDefinition[] = useMemo(
        () =>
            paginatedItems.map((item) => ({
                cells: [
                    createCell("year", `${item.year}-${item.date}-${item.title}`, item.year, parseYear(item.year)),
                    createCell("date", `${item.year}-${item.date}-${item.title}`, item.date, parseMonthDay(item.date)),
                    createCell("title", `${item.year}-${item.date}-${item.title}`, item.title, item.title),
                    createCell("detail", `${item.year}-${item.date}-${item.title}`, item.detail || "-", item.detail || "-"),
                ],
            })),
        [paginatedItems]
    );

    const searchOptions: SearchDefinition = {
        title: "一覧情報",
        accordionSx: { width: "100%" },
        elements: (
            <Box sx={{ p: 2, color: colors.grayDark, lineHeight: 1.8 }}>
                <Font14 sx={{ color: colors.grayDark }}>
                    年と日付でソートできます。初期表示は年の昇順です。
                </Font14>
            </Box>
        ),
    };

    return (
        <PageContainer>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                    <Font20>活動サマリー</Font20>
                </Box>

                <ControllableListView
                    page={tableState.page}
                    sortParams={tableState.sortParams}
                    rowsPerPage={tableState.rowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    onTableStateChange={setTableState}
                    rowData={rowData}
                    totalRowCount={activityItems.length}
                    columns={columns}
                    topPaginationHidden={true}
                    showSearchOptions={false}
                    //   searchOptions={searchOptions}
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
                        "& .MuiTableRow-root:hover .MuiTableCell-root": {
                            backgroundColor: colors.commonTableHover,
                        },
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                    }}
                />
            </Box>
        </PageContainer>
    );
};

export default SummaryPage;

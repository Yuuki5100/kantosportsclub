import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Box } from "@/components/base/Box";
import { Font14, Font20 } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import PageContainer from "@base/Layout/PageContainer";
import colors from "@/styles/colors";
import apiClient from "@/api/apiClient";
import { ControllableListView } from "@/components/composite";
import type { TableState } from "@/components/composite/Listview/ControllableListView";
import type { ColumnDefinition, RowDefinition } from "@/components/composite/Listview/ListView";

type ContactItem = {
  id: string;
  type: string;
  status: string;
  display: string | null;
  sentence: string;
  reporter: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const columns: ColumnDefinition[] = [
  { id: "id", label: "ID", display: false, sortable: false, align: "center", widthPercent: 20 },
  { id: "type", label: "種別", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "status", label: "状態", display: true, sortable: true, align: "center", widthPercent: 10 },
  { id: "display", label: "画面名", display: true, sortable: true, align: "left", widthPercent: 18 },
  { id: "sentence", label: "内容", display: true, sortable: false, align: "left", widthPercent: 28 },
  { id: "reporter", label: "投稿者", display: false, sortable: false, align: "center", widthPercent: 14 },
];

const truncateText = (value: string, maxLength = 20): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
};

const ContactListPage: React.FC = () => {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    rowsPerPage: 50,
    sortParams: {
      sortColumn: "createdAt",
      sortOrder: "desc",
    },
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ContactItem[]>("/api/contacts");
      setContacts(response.data);
      setTotalCount(response.data.length);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  const handleCreate = () => {
    void router.push("/contact/create");
  };

  const handleTableStateChange = (state: TableState) => {
    setTableState(state);
  };

  const handleRowClick = useCallback(
    (_row: RowDefinition, rowIndex: number) => {
      const contact = contacts[rowIndex];
      if (!contact?.id) {
        return;
      }

      void router.push(`/contact/detail?id=${encodeURIComponent(contact.id)}`);
    },
    [contacts, router]
  );

  const rowData: RowDefinition[] = useMemo(
    () =>
      contacts.map((contact) => ({
        cells: [
          { id: `id-${contact.id}`, columnId: "id", cell: contact.id, value: contact.id },
          { id: `type-${contact.id}`, columnId: "type", cell: contact.type, value: contact.type },
          { id: `status-${contact.id}`, columnId: "status", cell: contact.status, value: contact.status },
          { id: `display-${contact.id}`, columnId: "display", cell: contact.display ?? "", value: contact.display ?? "" },
          {
            id: `sentence-${contact.id}`,
            columnId: "sentence",
            cell: (
              <Box title={contact.sentence} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {truncateText(contact.sentence)}
              </Box>
            ),
            value: contact.sentence,
          },
          { id: `reporter-${contact.id}`, columnId: "reporter", cell: contact.reporter, value: contact.reporter },
        ],
      })),
    [contacts]
  );

  return (
    <PageContainer>
      <Box sx={{ width: "min(100vw - 64px, 1200px)", maxWidth: "100%", mx: "auto", py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Font20>問い合わせ一覧</Font20>
          <Font14 sx={{ color: colors.grayDark }}>
            contact テーブルの一覧を表示します。
          </Font14>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mb: 2 }}>
          <ButtonAction label="新規作成" onClick={handleCreate} />
        </Box>

        <ControllableListView
          page={tableState.page}
          rowsPerPage={tableState.rowsPerPage}
          sortParams={tableState.sortParams}
          rowData={rowData}
          totalRowCount={totalCount}
          columns={columns}
          onTableStateChange={handleTableStateChange}
          rowsPerPageOptions={[10, 20, 50]}
          showSearchOptions={false}
          onRowClick={handleRowClick}
          topPaginationHidden={true}
          bottomPaginationHidden={true}
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

        {loading && <Box sx={{ mt: 1, color: "text.secondary" }}>読み込み中...</Box>}
      </Box>
    </PageContainer>
  );
};

export default ContactListPage;

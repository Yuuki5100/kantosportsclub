import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Box, FlexBox, Font20 } from '@/components/base';
import { ListView } from '@/components/composite';
import type {
  ColumnDefinition,
  RowDefinition,
  SearchDefinition,
} from '@/components/composite/Listview/ListView';
import ButtonAction from '@/components/base/Button/ButtonAction';
import colors from '@/styles/colors';
import NoticeDetailPopup, { NoticeDetail, NoticeCreateData } from '@/pages/notice/NoticeDetailPopup';
import { createNoticeApi, updateNoticeApi, getNoticeListApi, getNoticeDetailApi } from '@/api/services/v1/noticeService';
import type { NoticeListItem } from '@/types/notice';
import { useSnackbar } from '@/hooks/useSnackbar';
import { usePermission } from '@/hooks/usePermission';
import { getMessage, MessageCodes } from '@/message';
const TopPage = () => {
  const { canEditNotice } = usePermission();
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDetail | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchNotices = useCallback(async () => {
    try {
      const data = await getNoticeListApi();
      setNotices(data.noticeList);
    } catch (err) {
      console.error('❌ Notice list fetch failed:', err);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, 'お知らせ一覧'), 'ERROR');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleDetailClick = async (notice: NoticeListItem) => {
    try {
      const detail = await getNoticeDetailApi(notice.noticeId);
      const noticeDetail: NoticeDetail = {
        id: detail.noticeId,
        title: detail.noticeTitle,
        periodStart: dayjs(detail.startDate, 'YYYY/MM/DD').isValid() ? dayjs(detail.startDate, 'YYYY/MM/DD') : null,
        periodEnd: dayjs(detail.endDate, 'YYYY/MM/DD').isValid() ? dayjs(detail.endDate, 'YYYY/MM/DD') : null,
        content: detail.contents ?? '',
        attachments: (detail.docIds ?? []).map((docId) => {
          const nameAfterSlash = docId.includes('/') ? docId.substring(docId.lastIndexOf('/') + 1) : docId;
          const originalName = nameAfterSlash.length > 37 ? nameAfterSlash.substring(37) : nameAfterSlash;
          return { fileId: docId, fileName: originalName, fileSize: '' };
        }),
      };
      setSelectedNotice(noticeDetail);
      setIsPopupOpen(true);
    } catch (err) {
      console.error('❌ Notice detail fetch failed:', err);
      showSnackbar(getMessage(MessageCodes.FETCH_FAILED, 'お知らせ詳細'), 'ERROR');
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setSelectedNotice(null);
  };

  const handleNoticeUpdate = async (updatedNotice: NoticeDetail) => {
    try {
      const docIds = updatedNotice.attachments.map((a) => a.fileId);
      await updateNoticeApi(updatedNotice.id, {
        noticeTitle: updatedNotice.title,
        startDate: updatedNotice.periodStart?.format('YYYY/MM/DD') ?? '',
        endDate: updatedNotice.periodEnd?.format('YYYY/MM/DD') ?? '',
        contents: updatedNotice.content,
        docIds,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, 'お知らせを更新'), 'SUCCESS');
      setIsPopupOpen(false);
      fetchNotices();
    } catch (err) {
      console.error('❌ Notice update failed:', err);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, 'お知らせの更新'), 'ERROR');
    }
  };

  const handleNoticeDelete = (noticeId: number) => {
    console.log('Notice deleted:', noticeId);
    setIsPopupOpen(false);
  };

  const handleCreateClick = () => {
    setIsCreatePopupOpen(true);
  };

  const handleCreatePopupClose = () => {
    setIsCreatePopupOpen(false);
  };

  const handleNoticeCreate = async (newNotice: NoticeCreateData) => {
    try {
      const docIds = newNotice.attachments.map((a) => a.fileId);

      const startDate = newNotice.periodStart?.format('YYYY/MM/DD')?.replace(/-/g, '/') ?? '';
      const endDate = newNotice.periodEnd?.format('YYYY/MM/DD')?.replace(/-/g, '/') ?? '';
      console.log('📅 Notice create dates:', { startDate, endDate });

      await createNoticeApi({
        noticeTitle: newNotice.title,
        startDate,
        endDate,
        contents: newNotice.content,
        docIds,
      });

      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, 'お知らせを登録'), 'SUCCESS');
      setIsCreatePopupOpen(false);
      fetchNotices();
    } catch (err) {
      console.error('❌ Notice create failed:', err);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, 'お知らせの登録'), 'ERROR');
    }
  };

  const columns: ColumnDefinition[] = useMemo(
    () => [
      { id: 'no', label: '#', display: true, sortable: false, widthPercent: 5 },
      { id: 'title', label: 'タイトル', display: true, sortable: false, widthPercent: 27, align: 'center' },
      { id: 'createdAt', label: '作成日', display: true, sortable: false, widthPercent: 14 },
      { id: 'createdBy', label: '作成者', display: true, sortable: false, widthPercent: 14 },
      { id: 'period', label: '期間', display: true, sortable: false, widthPercent: 28 },
      { id: 'detail', label: '詳細', display: true, sortable: false, widthPercent: 12 },
    ],
    []
  );

  const rowData: RowDefinition[] = useMemo(
    () =>
      notices.map((notice, idx) => ({
        cells: [
          { id: `${notice.noticeId}-no`, columnId: 'no', cell: idx + 1, value: idx + 1 },
          { id: `${notice.noticeId}-title`, columnId: 'title', cell: notice.noticeTitle, value: notice.noticeTitle },
          { id: `${notice.noticeId}-createdAt`, columnId: 'createdAt', cell: dayjs(notice.createdAt).format('YYYY/MM/DD'), value: notice.createdAt },
          { id: `${notice.noticeId}-createdBy`, columnId: 'createdBy', cell: notice.creatorUserName, value: notice.creatorUserName },
          {
            id: `${notice.noticeId}-period`,
            columnId: 'period',
            cell: `${notice.startDate}  ～  ${notice.endDate}`,
            value: `${notice.startDate}-${notice.endDate}`,
          },
          {
            id: `${notice.noticeId}-detail`,
            columnId: 'detail',
            cell: (
              <ButtonAction
                label="詳細"
                size="small"
                onClick={() => handleDetailClick(notice)}
                width={90}
                sx={{
                  backgroundColor: 'primary',
                  color: '#ffffff',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: 'primary',
                  },
                }}
              />
            ),
            value: notice.noticeId,
          },
        ],
      })),
    [notices]
  );

  const hiddenSearchOptions: SearchDefinition = useMemo(
    () => ({
      title: '',
      elements: null,
      accordionSx: { display: 'none' },
    }),
    []
  );

  return (
    <Box sx={{ width: '100%' }}>
      <FlexBox justifyContent="space-between" width="100%" sx={{ mb: 2 }}>
        <Font20 sx={{ fontWeight: 700 }}>お知らせ一覧</Font20>
        {canEditNotice && (
        <ButtonAction
          label="お知らせ登録"
          size="medium"
          onClick={handleCreateClick}
          width={140}
          sx={{
            backgroundColor: 'commonTableHeader',
            color: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: 'commonTableHeader',
            },
          }}
        />
        )}
      </FlexBox>

      <ListView
        columns={columns}
        rowData={rowData}
        searchOptions={hiddenSearchOptions}
        topPaginationHidden
        bottomPaginationHidden

        sx={{
          width: '100%',
          '& .MuiTableHead-root .MuiTableCell-root': {
            backgroundColor: colors.commonTableHeader,
            color: colors.commonFontColorBlack,
            fontWeight: 600,
          },
          '& .MuiTableBody-root .MuiTableCell-root': {
            backgroundColor: colors.commonFontColorWhite,
            color: colors.commonFontColorBlack,
          },
          '& .MuiTableRow-root:hover .MuiTableCell-root': {
            backgroundColor: colors.commonTableHover,
          },
        }}
      />

      <NoticeDetailPopup
        open={isPopupOpen}
        onClose={handlePopupClose}
        mode="detail"
        notice={selectedNotice}
        onUpdate={handleNoticeUpdate}
        onDelete={handleNoticeDelete}
      />

      <NoticeDetailPopup
        open={isCreatePopupOpen}
        onClose={handleCreatePopupClose}
        mode="create"
        onCreate={handleNoticeCreate}
      />
    </Box>
  );
};

export default TopPage;

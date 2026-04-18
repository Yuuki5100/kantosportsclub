import React, { useEffect, useState } from 'react';
import { useAddErrorCode, useErrorCodeList } from '@/api/services/v1/errorCodeService';
import { Box, DropBox, Font14, Font16, Font18, Font20, TextBox } from '@/components/base';
import { ListView } from '@/components/composite/Listview';
import ButtonAction from '@/components/base/Button/ButtonAction';
import { OptionInfo } from '@/components/base/Input/OptionInfo';
import cacheReloadUtils from '@/utils/cacheReloadUtils';
import { updateErrorCodeApi } from '@/api/services/v1/errorCodeService';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getMessage, MessageCodes } from '@/message';

type ErrorCode = {
  code: string;
  message: string;
  locale: string;
};

const ErrorCodeEditor: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [input, setInput] = useState<ErrorCode>({ code: '', message: '', locale: '' });
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const editedLocales: Record<string, string> = {};

  const options: OptionInfo[] = [
    { value: 'ja', label: 'ja' },
    { value: 'en', label: 'en' },
  ];

  const {
    data: errorCodesResponse,
    refetch,
    isFetching,
  } = useErrorCodeList();

  const { mutate: addErrorCode } = useAddErrorCode();

  useEffect(() => {
    refetch(); // 初回のみデータ取得
  }, [refetch]);

  const handleChangeMessage = (code: string, value: string) => {
    setEditedMessages((prev) => ({ ...prev, [code]: value }));
  };

  const handleChange = (key: keyof ErrorCode, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    if (!input.code || !input.message || !input.locale) {
      showSnackbar(getMessage(MessageCodes.ALL_FIELDS_REQUIRED), 'ERROR');
      return;
    }
    addErrorCode(input, {
      onSuccess: () => {
        showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, '追加'), 'SUCCESS');
        refetch();
      },
      onError: () => {
        showSnackbar(getMessage(MessageCodes.ACTION_FAILED, '追加'), 'ERROR');
      },
    });
  };

  const handleCacheUpdate = () => {
    cacheReloadUtils('errorCode');
    refetch();
  };

  const handleUpdate = async (err: ErrorCode) => {
    const updatedMessage = editedMessages[err.code] ?? err.message;
    const updatedLocale = editedLocales[err.code] ?? err.locale;

    try {
      await updateErrorCodeApi(err.code, {
        code: err.code,
        message: updatedMessage,
        locale: updatedLocale,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, '更新'), 'SUCCESS');
      refetch();
    } catch (error) {
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, '更新'), 'ERROR');
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        p: 6,
        maxWidth: '64rem',
        mx: 'auto',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Font20 sx={{ fontSize: 24, fontWeight: 'bold' }}>エラーコード編集画面</Font20>

      {isFetching ? (
        <Box>読み込み中...</Box>
      ) : (
        <>
          <Font18 sx={{ fontSize: 18, fontWeight: 600 }}>新規追加</Font18>

          <Box sx={{ width: '47%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <Font16 sx={{ fontWeight: 600, width: '50%' }}>エラーコード</Font16>
              <Font16 sx={{ fontWeight: 600, width: '50%' }}>メッセージ</Font16>
              <Font16 sx={{ fontWeight: 600, width: '50%' }}>ロケール</Font16>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <TextBox
                value={input.code}
                onChange={(e) => handleChange('code', e.target.value)}
                name="code"
                customStyle={{ width: '100%', fontSize: '14px' }}
              />
              <TextBox
                value={input.message}
                onChange={(e) => handleChange('message', e.target.value)}
                name="message"
                customStyle={{ width: '100%', fontSize: '14px' }}
              />
              <DropBox
                name="locale"
                customStyle={{ width: '10%' }}
                options={options}
                onChange={(e) => handleChange('locale', e.target.value)}
              />
            </Box>

            <ButtonAction label="追加" onClick={handleAdd} />
          </Box>

          <Box component="section">
            <Font16 sx={{ fontSize: 16, fontWeight: 600, mt: 4 }}>一覧と編集</Font16>

            <ListView
              columns={[
                { display: true, id: 'id', label: 'Id', sortable: true },
                { display: true, id: 'code', label: 'Code', sortable: true },
                { display: true, id: 'message', label: 'Message', sortable: true },
                { display: true, id: 'locale', label: 'Locale', sortable: true },
                { display: true, id: 'operation', label: '操作', sortable: true },
              ]}
              onPageChange={() => {}}
              rowData={
                errorCodesResponse?.data?.map((errorRes, index) => ({
                  cells: [
                    {
                      cell: <Font14>{index + 1}</Font14>,
                      columnId: 'id',
                      id: `row-${index}-id`,
                      value: index,
                    },
                    {
                      cell: <Font14>{errorRes.code}</Font14>,
                      columnId: 'code',
                      id: `row-${index}-code`,
                      value: errorRes.code,
                    },
                    {
                      cell: (
                        <TextBox
                          value={editedMessages[errorRes.code] ?? errorRes.message}
                          onChange={(e) => handleChangeMessage(errorRes.code, e.target.value)}
                          name="message"
                          clearButton={false}
                        />
                      ),
                      columnId: 'message',
                      id: `row-${index}-message`,
                      value: errorRes.message,
                    },
                    {
                      cell: <Font14>{errorRes.locale}</Font14>,
                      columnId: 'locale',
                      id: `row-${index}-locale`,
                      value: errorRes.locale,
                    },
                    {
                      cell: (
                        <ButtonAction
                          label="変更"
                          size="large"
                          onClick={() => handleUpdate(errorRes)}
                        />
                      ),
                      columnId: 'operation',
                      id: `row-${index}-operation`,
                      value: '変更',
                    },
                  ],
                })) ?? []
              }
            />
          </Box>

          <Box sx={{ mt: 4 }}>
            <ButtonAction label="キャッシュの再読み込み" onClick={handleCacheUpdate} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ErrorCodeEditor;

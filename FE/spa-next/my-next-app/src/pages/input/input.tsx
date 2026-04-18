'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useApiMutation } from '@/hooks/useApi';
import { useValidationLang } from '@/hooks/useValidationLang';
import { validateFile } from '@/utils/validateFile';
import { uploadFile } from '@/utils/uploadFile';
import { formatTimestamp } from '@/utils/formatUtils';
import type { JobStatus } from '@/types/job';

import PageContainer from '@base/Layout/PageContainer';
import Font30 from '@/components/base/Font/Font30';
import Font24 from '@/components/base/Font/Font24';
import FormRow from '@/components/base/Input/FormRow';
import ButtonAction from '@/components/base/Button/ButtonAction';
import ListView, {
  ColumnDefinition,
  RowDefinition,
} from '@/components/composite/Listview/ListView';
import LoadingSpinner from '@composite/LoadingSpinner';
import { Box } from '@/components/base';
import { templateGet } from '@/utils/templateGet';
import { parseTemplateSchema } from '@/utils/file/schemas/schema';
import { getOrFetchTemplateSchema } from '@/utils/cache/cacheUtils';
import { UploadFileResult } from '@/utils/file/types';
import type { NotificationPayload } from '@/components/providers/WebSocketProvider';
import { downloadBlobFile } from '@/utils/downloadBlobFile';
import { downloadImportFile, requestDownloadReady, useImportHistory } from '@/api/services/v1/importService';
import { getMessage, MessageCodes } from '@/message';

const InputPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<string>('users');
  const [isUploading, setIsUploading] = useState(false);
  const [jobName, setjobName] = useState<string>('0');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refId, setRefId] = useState<string>('0');
  const [reportId, setReportId] = useState<string>('0');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // BEのreportrunnerに使用する
  const [extention, setExtention] = useState<string>('');
  // const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const reportIdRef = useRef<string | undefined>(reportId);
  useEffect(() => {
    reportIdRef.current = reportId;
  }, [reportId]);
  const extentionRef = useRef<string | undefined>(extention);
  useEffect(() => {
    extentionRef.current = extention;
  }, [extention]);
  // グローバルなWebsocketを使う場合
  // useWSSubscription('FILE_UPLOAD_COMPLETED');
  // useWSSubscription('FILE_DOWNLOAD_COMPLETED');

  type Option = { value: string; label: string };
  const options: Option[] = [
    { value: '0', label: 'ダミー項目' },
    { value: '3', label: 'users' },
    { value: '4', label: '010_R01' },
  ];

  // const [exportTargetForFile, setExportTargetForFile] = useState<'none' | 'excelFile' | 'pdfFile'>('none');
  // const fileMutation = useFetchReportFile(exportTargetForFile as 'excelFile' | 'pdfFile');

  const { showSnackbar } = useSnackbar();
  const showSuccess = useCallback((msg: string) => showSnackbar(msg, 'SUCCESS'), [showSnackbar]);
  const showError = useCallback((msg: string) => showSnackbar(msg, 'ERROR'), [showSnackbar]);
  const t = useValidationLang();

  const showSnackbarSuccess = (msg: string): void => {
    console.log('[Snackbar SUCCESS]', msg);
    showSnackbar(msg, 'SUCCESS');
  };

  const {
    data: response,
    refetch: fetchHistory,
  } = useImportHistory();

  // ダウンロード準備
  const FileDownloadReady = useApiMutation<UploadFileResult, object>(
    'post',
    `/import/downloadReady?reportId=${reportId}&fileName=${fileName}&extention=${extention}`,
    {
      mutationFn: async () => {
        const res = await requestDownloadReady(reportId, fileName, extention);
        return res as UploadFileResult;
      },
      onSuccess: (response) => {
        showSuccess('✅帳票出力ジョブを登録しました！');
        setjobName(response.data.jobName || '');
      },
      onError: () => {
        showError(getMessage(MessageCodes.JOB_REGISTER_FAILED));
      },
    }
  );

  // ダウンロード
  const FileDownload = useApiMutation('post', `/import/download?jobName=${jobName}`, {
    mutationFn: async () => {
      return await downloadImportFile(jobName);
    },
    onSuccess: (data: Blob) => {
      showSuccess('✅ファイルダウンロード可能です！');
      downloadBlobFile(data, fileName);
    },
    onError: () => {
      showError(getMessage(MessageCodes.DOWNLOAD_FAILED));
    },
  });

  // useApiMutation を利用してユーザー情報更新のミューテーションを作成
  const handleDownloadReady = () => {
    // 一旦コメントアウト（検証の邪魔になるので）
    // if (!refId || !fileName || !reportId) {
    //   showError('ダウンロードに必要な情報が不足しています');
    //   return;
    // }

    // stateが効かないので、無理やり最新のstateを持ってくるように指示
    setExtention('pdf');
    FileDownloadReady.mutate({ reportId, fileName, extention });
  };

  // useApiMutation を利用してユーザー情報更新のミューテーションを作成
  const handleDownload = useCallback(() => {
    FileDownload.mutate({ jobName });
  }, [FileDownload, jobName]);

  const history: JobStatus[] = Array.isArray(response?.data) ? response.data : [];

  useEffect(() => {
    // Websocketを使う場合、このuseEffect内の内容を個別実装する必要があります

    // 1. 画面起動時に、通知を受け取りたいものを第3引数に指定して、Websockeを起動しておく
    // connectWebSocket(onMessage, showSuccess, showError, 'FILE_UPLOAD_COMPLETED')

    /* 2.以下、どちらかのハンドラを使用して、Websocketの通知を受け取った際の処理を実装してください
     *
     * 　2.1. SingleHandler（Websocket）
     *   1画面で通知を１つだけ登録したい時のSingleHandlerの使い方
     */
    // const handleMessage = (payload: NotificationPayload) => {
    //   console.log('🔔 通知受信:', payload);
    //   const resEventType = payload.eventType;
    //   const resRefId = payload.refId;
    //   // イベント種別に応じて処理を分ける
    //   if (resEventType === 'FILE_UPLOAD_COMPLETED' && refId === resRefId) {
    //     console.log(`📦 インポート完了通知: refId`);
    //     disconnectWebSocket(); // 通知したらwebsocket切断

    /*  2.2. MultiHandler（Websocket）
     *   1画面で通知を複数登録したい時のMultiHandlerの使い方
     */
    const _handleMultiMessage = (
      payload: NotificationPayload,
      eventType: string // ← connectWebSocket が渡してくれる
    ) => {
      switch (eventType) {
        /* アップロード完了通知 ---------------------------- */
        // ここの条件分岐は、websocketClient側で、eventTypeをlowerCaseにしてしまっているため
        // 小文字で判定を行うようにしてください
        case 'file_upload_completed': {
          const resRefId = payload.refId;
          setRefId(resRefId || '');
          showSuccess('📤 アップロードが完了しました');
          break;
        }
        /* ダウンロード完了通知 ---------------------------- */
        case 'file_download_completed': {
          const resReportId = `${payload.refId}`;
          if (reportIdRef.current == resReportId) {
            // disconnectWebSocket(); // 通知したらwebsocket切断（ダウンロードしたら流石に用済み）
            handleDownload();
          }
          break;
        }
      }
    };

    // websocket起動（同時にsubscribeする通知を定数で定義する）
  //   // GlovalWebsocketを使う場合はコメントアウトしてください
  //   // connectWebSocket(
  //   //   handleMultiMessage as (payload: unknown, eventType: string) => void,
  //   //   showSuccess,
  //   //   showError,
  //   //   ['FILE_UPLOAD_COMPLETED', 'FILE_DOWNLOAD_COMPLETED']
    // );
  }, [handleDownload, showSuccess]);

  const handleUpload = async () => {
    if (isUploading) return;

    if (!file) {
      showError(getMessage(MessageCodes.FILE_REQUIRED));
      return;
    }

    if (!kind) {
      showError(getMessage(MessageCodes.KIND_REQUIRED_SELECT));
      return;
    }

    setIsUploading(true);
    let success = false;

    try {
      console.log('該当テンプレートを取得します：' + kind);
      // 以下ファイルインポート時に呼び出される処理
      // どのファイルに何のバリデーションチェックを行うのかを指定している

      // キャッシュ完全実装時に、コメントアウトを削除する
      // ============================================================================
      // キャッシュを取得
      // let schema: TemplateSchemaFromYAML | null = getCachedTemplateSchema(kind);
      // キャッシュからデータが取得できた場合
      // if (schema) {
      //   console.log('✅バリデーションテンプレート取得完了');
      // } else {
      // ============================================================================
      // キャッシュ部品を使用しているが、現状都度取得している
      await getOrFetchTemplateSchema(kind, async () => {
        const yamlResponse = await templateGet(
          '/import/templateGet',
          kind,
          showSnackbarSuccess,
          showError,
          fetchHistory
        );
        return parseTemplateSchema(kind, yamlResponse);
      });

      const isValid = await validateFile(file, kind, t, showError);
      if (!isValid) return;

      const response: UploadFileResult = await uploadFile(
        file,
        kind,
        '/import/upload',
        showSnackbarSuccess,
        showError,
        fetchHistory
      );
      success = true;

      /* ファイルインポート後処理
       *   インポートが完了したら、
       *　　　帳票ID（インポートに限ってはjobIDのような扱い）、インポートしたファイルの拡張子、インポートしたファイル名をstateに保存しておく
       */
      const tmpRefId = response.data.refId;
      const tmpExtention = response.data.extension;
      const tmpfileName = response.data.fileName;
      setRefId(tmpRefId || '');
      if (tmpExtention === 'xlsx') {
        setExtention('excel');
      } else {
        setExtention(tmpfileName || '');
      }

      console.log('帳票番号 : ' + tmpRefId + ' 拡張子：' + tmpExtention);
    } catch (e) {
      // エラーハンドリング
      showError(
        getMessage(
          MessageCodes.UPLOAD_FAILED_WITH_REASON,
          e instanceof Error ? e.message : '原因不明'
        )
      );
    } finally {
      if (success) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      setIsUploading(false);
    }
  };

  // ジョブ履歴テーブルのヘッダ定義
  const columns: ColumnDefinition[] = [
    { id: 'jobName', label: 'ジョブ名', display: true, sortable: true },
    { id: 'status', label: 'ステータス', display: true, sortable: true },
    { id: 'startTime', label: '開始', display: true, sortable: true },
    { id: 'endTime', label: '終了', display: true, sortable: true },
    { id: 'message', label: '詳細', display: true, sortable: false },
  ];

  // ジョブ履歴の明細レコード定義
  const rowData: RowDefinition[] = history.map((job) => ({
    cells: [
      { id: `${job.id}-name`, columnId: 'jobName', cell: job.jobName, value: job.jobName },
      { id: `${job.id}-status`, columnId: 'status', cell: job.status, value: job.status },
      {
        id: `${job.id}-start`,
        columnId: 'startTime',
        cell: formatTimestamp(job.startTime),
        value: job.startTime,
      },
      {
        id: `${job.id}-end`,
        columnId: 'endTime',
        cell: formatTimestamp(job.endTime),
        value: job.endTime,
      },
      {
        id: `${job.id}-message`,
        columnId: 'message',
        cell: (
          <details>
            <summary>表示</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {typeof job.message === 'string' ? job.message : JSON.stringify(job.message, null, 2)}
            </pre>
          </details>
        ),
        value: 0,
      },
    ],
  }));

  // セレクトボックスによって、動的にパラメータを設定
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportId(e.target.value);
    const reportStr = options.find((opt) => opt.value === e.target.value)?.label ?? '';
    setFileName(reportStr);
  };

  // TSX要素
  return (
    <PageContainer>
      <LoadingSpinner open={isUploading} />
      <Font30>ファイルアップロード</Font30>

      <Box mt={3}>
        <FormRow label="ファイル" required>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </FormRow>

        <FormRow label="アップロードファイル種別" required>
          <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ width: '200px' }}>
            <option value="users">ユーザー情報_v1</option>
            <option value="users_v2">ユーザー情報_v2</option>
            <option value="orders">注文情報</option>
          </select>
        </FormRow>

        <FormRow label="ダウンロードテンプレート種別" required>
          <select value={reportId} onChange={handleChange} style={{ width: '200px' }}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormRow>

        <ButtonAction label="アップロード" onClick={handleUpload} disabled={isUploading} />
        <ButtonAction label="ダウンロード" onClick={handleDownloadReady} />
      </Box>

      <Box mt={6}>
        <Font24>インポート履歴</Font24>
        <ListView columns={columns} rowData={rowData} />
      </Box>
    </PageContainer>
  );
};

export default InputPage;

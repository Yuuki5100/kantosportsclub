import { useEffect, useState } from "react";
import {
  useReportList,
  useFetchReportFile,
  useKickReportJob
} from '@api/services/v1/reportService';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { RootState } from '@/store';
import { startJob } from '@slices/reportJobSlice';
import { getMessage, MessageCodes } from '@/message';

const MIME_TYPE_MAP: Record<string, string> = {
  excelFile: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdfFile: "application/pdf"
};

const FILE_NAME_MAP: Record<string, string> = {
  excelFile: "report.xlsx",
  pdfFile: "report.pdf"
};

const ExportPage = () => {
  const dispatch = useAppDispatch();
  const { status: jobStatus, downloadUrl } = useAppSelector((state: RootState) => state.reportJob);

  const [reportId, setReportId] = useState(0);
  const [exportTargetForFile, setExportTargetForFile] = useState<'none' | 'excelFile' | 'pdfFile'>('none');

  const { data: reportList, isLoading: isLoadingReportList, error: errorReportList } = useReportList();

  // 帳票ファイル取得のMutation hook（初期化しておく）
  const fileMutation = useFetchReportFile(exportTargetForFile as 'excelFile' | 'pdfFile');

  // ファイルをbase64からBlobに変換して即ダウンロード
  useEffect(() => {
    if (fileMutation.data && exportTargetForFile !== 'none') {
      const byteCharacters = atob(fileMutation.data.data);
      const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
      const mimeType = MIME_TYPE_MAP[exportTargetForFile];
      const fileName = FILE_NAME_MAP[exportTargetForFile];

      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      setExportTargetForFile('none');
    }
  }, [fileMutation.data, exportTargetForFile]);

  // ファイルダウンロードボタン押下時
  const handleFileDownload = (target: 'excelFile' | 'pdfFile') => {
    setExportTargetForFile(target);
    //setTimeoutで、targetがnoneのまま実行されないよう制御する
    setTimeout(async () => {
      try {
        //fileMutation が事前に target に紐づいている
        await fileMutation.mutateAsync({ reportId });
      } catch (e) {
        console.error("ファイルダウンロード失敗", e);
      }
    }, 0); // 次のイベントループで確実に state が反映された後に処理される
  };

  // ダウンロードリンク作成ボタン押下時
  const { mutateAsync: kickJob } = useKickReportJob();
  const handleUrlDownload = async (target: 'excelUrl' | 'pdfUrl') => {
    if (jobStatus === 'RUNNING') return;

    try {
      const response = await kickJob({ reportId, exportTarget: target });
      if (response?.data) {
        dispatch(startJob(response.data));
      }
    } catch (e) {
      console.error("ジョブキック失敗", e);
    }
  };

  if (isLoadingReportList) return <p>帳票一覧を取得中...</p>;
  if (errorReportList) {
    return <p>{getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, errorReportList.message)}</p>;
  }

  return (
    <div>
      <h1>帳票を出力します。</h1>
      <h2>帳票一覧</h2>

      {fileMutation.isPending && <p>ファイルを作成中...</p>}
      {fileMutation.error && (
        <p>
          {getMessage(
            MessageCodes.FILE_CREATE_ERROR_WITH_DETAIL,
            (fileMutation.error as Error).message
          )}
        </p>
      )}

      {jobStatus === 'RUNNING' && <p>リンクを作成中...</p>}
      {jobStatus === 'FAILED' && <p>{getMessage(MessageCodes.ACTION_FAILED, 'リンク作成')}</p>}

      <select
        name="帳票選択"
        value={reportId}
        onChange={(e) => setReportId(Number(e.target.value))}
      >
        <option key="0" value="0">選択してください</option>
        {reportList?.data?.map(report => (
          <option key={report.reportId} value={report.reportId}>
            {report.description}
          </option>
        ))}
      </select>

      <button onClick={() => handleFileDownload('excelFile')}>Excel</button>
      <button onClick={() => handleUrlDownload('excelUrl')}>Excel (リンク)</button>
      <button onClick={() => handleFileDownload('pdfFile')}>PDF</button>
      <button onClick={() => handleUrlDownload('pdfUrl')}>PDF (リンク)</button>

      {jobStatus === 'COMPLETED' && downloadUrl && (
        <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
          ダウンロードリンクはこちら
        </a>
      )}
    </div>
  );
};

export default ExportPage;

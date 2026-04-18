import React, { useState } from 'react';
import { apiService } from '@/api/apiService';
import { getMessage, MessageCodes } from '@/message';

const BulkExportForm: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel'>('pdf');
  const [fileNamePrefix, setFileNamePrefix] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setMessage(getMessage(MessageCodes.FILE_REQUIRED));
      return;
    }

    // 仮にファイル名が「12345_reportA.pdf」などで、先頭の数字をreportIdとして扱う例
    const reportIds = Array.from(files)
      .map((file) => {
        const match = file.name.match(/^(\d+)/);
        return match ? Number(match[1]) : 0;
      })
      .filter((id) => id > 0);

    if (reportIds.length === 0) {
      setMessage(getMessage(MessageCodes.BULK_EXPORT_INVALID_ID));
      return;
    }

    const requestBody = {
      reportIds,
      outputFormat,
      fileNamePrefix,
    };

    try {
      const response = await apiService.post<{ message?: string }>('api/report/export/bulk', requestBody);
      setMessage(
        getMessage(
          MessageCodes.SUCCESS_WITH_DETAIL,
          response.message || getMessage(MessageCodes.COMPLETE)
        )
      );
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : getMessage(MessageCodes.SUBMIT_FAILED);
      setMessage(getMessage(MessageCodes.ERROR_OCCURRED_WITH_DETAIL, errMessage));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>📁 一括レポート出力</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>ファイル選択（複数可）:</label>
          <br />
          <input type="file" multiple onChange={handleFileChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>出力形式:</label>
          <br />
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'excel')}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>ファイル名プレフィックス（任意）:</label>
          <br />
          <input
            type="text"
            value={fileNamePrefix}
            onChange={(e) => setFileNamePrefix(e.target.value)}
          />
        </div>

        <button type="submit">送信</button>
      </form>

      {message && <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{message}</div>}
    </div>
  );
};

export default BulkExportForm;

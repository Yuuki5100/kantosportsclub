// components/FileImportSection.tsx
import React, { useState } from 'react';

type Props = {
  onUpload: (file: File | null) => void;
};

const FileImportSection: React.FC<Props> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={() => onUpload(selectedFile)} style={{ marginLeft: '1rem' }}>
        アップロード
      </button>
    </div>
  );
};

export default FileImportSection;

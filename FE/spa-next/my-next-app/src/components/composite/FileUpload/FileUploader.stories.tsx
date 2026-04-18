// FileUploader.stories.tsx
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from ".";
import type { UploadedFile } from "@hooks/useFileUploader";
import { Provider } from "react-redux";
import store from "../../../store"; // パス調整（相対パス）
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 新しい QueryClient を作成
const queryClient = new QueryClient();

const meta: Meta<typeof FileUpload> = {
  title: "Composite/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  render: () => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FileUpload />
      </QueryClientProvider>
    </Provider>
  ),
};

export const WithOnChange: Story = {
  render: () => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WithOnChangeExample />
      </QueryClientProvider>
    </Provider>
  ),
};

const WithOnChangeExample = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  return (
    <div>
      <FileUpload
        onChange={(files) => {
          console.log("アップロード成功ファイル", files);
          setUploadedFiles(files);
        }}
      />
      <div style={{ marginTop: "1rem" }}>
        <strong>アップロード済ファイル:</strong>
        <ul>
          {uploadedFiles.map((file) => (
            <li key={file.fileId}>{file.fileName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const WithInitialFiles: Story = {
  render: () => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FileUpload
          initialFiles={[
            { fileId: "1", fileName: "仕様書_v1.pdf",fileSize:'1MB' },
            { fileId: "2", fileName: "設計レビュー.xlsx",fileSize:'1MB'  },
          ]}
        />
      </QueryClientProvider>
    </Provider>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FileUpload
          disabled
          initialFiles={[
            { fileId: "1", fileName: "見積書_2025.pdf",fileSize:'1MB'  },
            { fileId: "2", fileName: "チェックリスト.xlsx",fileSize:'1MB'  },
          ]}
        />
      </QueryClientProvider>
    </Provider>
  ),
};

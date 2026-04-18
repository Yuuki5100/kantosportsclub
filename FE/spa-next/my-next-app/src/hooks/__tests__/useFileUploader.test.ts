// src/components/file-uploader/__tests__/hook.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useFileUploader, UploadedFile } from '@/hooks/useFileUploader';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { downloadBlobFile } from '@/utils/downloadBlobFile';

jest.mock('@/hooks/useSnackbar');
jest.mock('@tanstack/react-query');
jest.mock('@/api/apiClient');
jest.mock('@/utils/downloadBlobFile');

describe('useFileUploader フック', () => {
  const mockShowSnackbar = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
  });

  it('初期値が反映される', () => {
    const initialFiles: UploadedFile[] = [
      { fileId: '1', fileName: 'file1.csv', fileSize: '123' },
    ];

    const { result } = renderHook(() =>
      useFileUploader({ initialFiles })
    );

    expect(result.current.files).toEqual(initialFiles);
  });

  it('handleUpload が mutate を呼ぶ', async () => {
    const { result } = renderHook(() => useFileUploader());

    const file = new File(['content'], 'test.csv', { type: 'text/csv' });

    act(() => {
      result.current.handleUpload(file);
    });

    expect(mockMutate).toHaveBeenCalledWith(file);
  });

  it('handleFileChange で選択ファイルが handleUpload される', async () => {
    const { result } = renderHook(() => useFileUploader());

    const file = new File(['content'], 'test.csv', { type: 'text/csv' });

    const changeEvent = {
      target: { files: [file], value: '' },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(changeEvent);
    });

    expect(mockMutate).toHaveBeenCalledWith(file);
    expect(changeEvent.target.value).toBe(''); // 再選択可能
  });

  it('handleDownload で downloadBlobFile が呼ばれる', async () => {
    const blob = new Blob(['content']);
    (apiClient.get as jest.Mock).mockResolvedValue({ data: blob });

    const { result } = renderHook(() => useFileUploader());

    const file = { fileId: '1', fileName: 'file.csv', fileSize: '123' };

    await act(async () => {
      await result.current.handleDownload(file);
    });

    expect(downloadBlobFile).toHaveBeenCalledWith(blob, 'file.csv');
  });

  it('deleteFile でファイル削除され showSnackbar が呼ばれる', async () => {
    const initialFiles: UploadedFile[] = [
      { fileId: '1', fileName: 'file1.csv', fileSize: '123' },
    ];
    (apiClient.delete as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useFileUploader({ initialFiles }));

    await act(async () => {
      await result.current.deleteFile('1');
    });

    expect(result.current.files).toEqual([]);
    expect(mockShowSnackbar).toHaveBeenCalledWith('削除しました', 'SUCCESS');
  });
});

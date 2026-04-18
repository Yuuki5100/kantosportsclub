import { render, screen, fireEvent } from '@testing-library/react';
import FileImportSection from '../FileImportSection';

describe('FileImportSection コンポーネント', () => {
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ファイルを選択してアップロードボタンを押すと onUpload が呼ばれる', () => {
    const { container } = render(<FileImportSection onUpload={mockOnUpload} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadButton = screen.getByText('アップロード');

    const file = new File(['dummy content'], 'sample.csv', { type: 'text/csv' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(uploadButton);

    expect(mockOnUpload).toHaveBeenCalledWith(file);
  });

  it('ファイルを選択せずにアップロードボタンを押すと onUpload は null で呼ばれる', () => {
    render(<FileImportSection onUpload={mockOnUpload} />);

    const uploadButton = screen.getByText('アップロード');

    fireEvent.click(uploadButton);

    expect(mockOnUpload).toHaveBeenCalledWith(null);
  });
});

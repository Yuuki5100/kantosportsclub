// __tests__/downloadBlobFile.test.ts
import { jest } from '@jest/globals';

describe('downloadBlobFile', () => {
  let downloadBlobFile: typeof import('@/utils/downloadBlobFile').downloadBlobFile;

  beforeAll(async () => {
    // 動的インポート（ESModule対応）
    const module = await import('@/utils/downloadBlobFile');
    downloadBlobFile = module.downloadBlobFile;

    // jsdom環境で存在しないwindow.URL.createObjectURLとrevokeObjectURLをモック
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = jest.fn(() => 'mock-url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = jest.fn();
    }
  });

  it('Blobをダウンロードできるようにaタグを作成してクリックする', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const filename = 'test.txt';

    // ここで実際のNodeを作りつつclickだけをスパイ
    const anchor = document.createElement('a');
    const clickMock = jest.spyOn(anchor, 'click').mockImplementation(() => {});

    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');

    // document.createElementを本物のaタグ生成に差し替え
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        if (tagName === 'a') return anchor;
        return document.createElement(tagName);
      });

    const urlSpy = jest.spyOn(window.URL, 'createObjectURL');
    const revokeSpy = jest.spyOn(window.URL, 'revokeObjectURL');

    downloadBlobFile(blob, filename);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalledWith(anchor);
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(urlSpy).toHaveBeenCalledWith(blob);
    expect(revokeSpy).toHaveBeenCalledWith('mock-url');

    // 後片付け
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    clickMock.mockRestore();
    urlSpy.mockRestore();
    revokeSpy.mockRestore();
  });
});

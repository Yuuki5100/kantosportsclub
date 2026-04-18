// utils/downloadBlobFile.ts

/**
 * バイナリデータをブラウザ上でファイルとしてダウンロードさせるユーティリティ
 *
 * @param blob - ダウンロード対象のBlobデータ（例: APIレスポンス）
 * @param filename - 保存時のファイル名（拡張子付き）
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // 後処理
  window.URL.revokeObjectURL(url);
  document.body.removeChild(anchor);
}

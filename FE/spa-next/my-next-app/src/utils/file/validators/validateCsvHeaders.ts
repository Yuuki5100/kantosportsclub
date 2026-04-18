/**
 * CSVファイルのヘッダー行を検証するユーティリティ関数
 *
 * @param file - ユーザーがアップロードしたCSVファイル
 * @param expectedHeaders - 期待されるヘッダーのリスト（順不同で照合）
 * @param t - エラーメッセージのテンプレートを含む翻訳マップ
 * @param headerRowIndex - ヘッダー行のインデックス（デフォルトは0行目）
 * @param delimiter - CSVの区切り文字（デフォルトはカンマ）
 * @param maxRows - 最大許容行数（省略可能）
 * @returns ヘッダーに関するエラー文字列の配列。問題なければ `null`。
 */
export const validateCsvHeaders = async (
  file: File,
  expectedHeaders: string[],
  t: Record<string, string>,
  headerRowIndex: number = 0,
  delimiter: string = ',',
  maxRows?: number
): Promise<string[] | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader(); // 非同期でファイルを読み込むFile API

    // ファイル読み込み成功時の処理
    reader.onload = () => {
      const text = reader.result as string; // ファイル内容を文字列として取得
      const lines = text
        .split(/\r?\n/) // 改行コードで分割（CRLF or LF 対応）
        .filter((line) => line.trim() !== ''); // 空行を除外

      const errors: string[] = []; // 検出されたエラーを格納する配列

      // ===============================
      // ヘッダー行の存在チェック
      // ===============================
      if (!lines[0].trim().startsWith(expectedHeaders[0])) {
        const msg = (t.HEADER_NOT_FOUND || getMessage(MessageCodes.CSV_HEADER_NOT_FOUND))
          .replace('{count}', `${lines.length}`);
        errors.push(msg);
        resolve(errors); // エラーを返して終了
        return;
      }

      // ===============================
      // 行数の上限チェック
      // ===============================
      if (maxRows && lines.length > maxRows) {
        const msg = (t.MAX_ROW_EXCEEDED || getMessage(MessageCodes.CSV_MAX_ROW_EXCEEDED))
          .replace('{max}', `${maxRows}`)
          .replace('{actual}', `${lines.length}`);
        errors.push(msg);
        resolve(errors); // エラーを返して終了
        return;
      }

      // ===============================
      // ヘッダー行のパースと検証（正しい形式のヘッダーが連携されているか確認）
      // ===============================
      const headerLine = lines[headerRowIndex]; // 指定行の文字列を取得
      const actualHeaders = headerLine
        .split(delimiter) // 区切り文字で分割
        .map((h) => h.trim()); // 前後の空白を削除

      // 期待されているヘッダーのうち、存在しないものを抽出
      const missing = expectedHeaders.filter((h) => !actualHeaders.includes(h));

      // ファイルに含まれているヘッダーのうち、不要なものを抽出
      const extra = actualHeaders.filter((h) => !expectedHeaders.includes(h));

      // 欠落しているヘッダーがあればエラーメッセージ追加
      if (missing.length > 0) {
        const msg = (t.HEADER_MISSING || getMessage(MessageCodes.CSV_HEADER_MISSING))
          .replace('{missing}', missing.join(', '));
        errors.push(msg);
        resolve(errors); // エラーを返して終了
        return;
      }

      // 余分なヘッダーがあればエラーメッセージ追加
      if (extra.length > 0) {
        const msg = (t.HEADER_EXTRA || getMessage(MessageCodes.CSV_HEADER_EXTRA))
          .replace('{extra}', extra.join(', '));
        errors.push(msg);
        resolve(errors); // エラーを返して終了
        return;
      }

      // エラーが存在する場合は配列を返し、なければnullを返す
      resolve(errors.length > 0 ? errors : null);
    };

    // ファイル読み取りエラー時の処理
    reader.onerror = () => {
      const errMsg = t.READ_ERROR || getMessage(MessageCodes.FILE_READ_ERROR);
      resolve([errMsg]);
    };

    // テキストファイルとして読み込み開始（非同期）
    reader.readAsText(file);
  });
};
import { getMessage, MessageCodes } from '@/message';

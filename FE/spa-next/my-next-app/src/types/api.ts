import { InternalAxiosRequestConfig } from "axios";

/**
 * Axios リクエストメタ情報
 * - リクエスト開始時間などのトラッキング用途で使用
 */
export interface RequestMetadata {
  startTime: number;
}

/**
 * カスタムAxiosリクエスト設定
 * - metadata を付与してパフォーマンス監視等に利用
 */
export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: RequestMetadata;
}

/**
 * 共通APIレスポンス型
 * @template T - dataの型（成功時の返却データ）
 *
 * - success: APIの成功可否
 * - data: 成功時のデータ
 * - error: エラー内容（文字列 / 配列 / エラーオブジェクト）
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string | { code: string; message: string } | string[] | null;
}


// src/config/cacheStrategies.ts

export interface CacheStrategy {
    staleTime: number;
    gcTime: number;
  }
  
  export const CacheStrategies: Record<string, CacheStrategy> = {
    // 最新情報が必須な場合（例：チャット、通知）
    REAL_TIME: {
      staleTime: 0,
      gcTime: 30 * 1000, // 30秒間キャッシュ
    },
    // 更新頻度は高いが多少の遅延が許容される場合（例：ダッシュボード）
    FREQUENT_UPDATE: {
      staleTime: 2 * 60 * 1000, // 2分間新鮮
      gcTime: 10 * 60 * 1000, // 10分間キャッシュ
    },
    // 静的・ほぼ変わらないデータ（例：アプリ設定、固定リスト）
    STATIC: {
      staleTime: 60 * 60 * 1000, // 1時間
      gcTime: 24 * 60 * 60 * 1000, // 1日
    },
    // ユーザー固有のデータ（例：プロフィール、アカウント設定）
    USER_SPECIFIC: {
      staleTime: 10 * 60 * 1000, // 10分
      gcTime: 15 * 60 * 1000, // 15分
    },
    // 読み込みが多く更新が稀なデータ（例：商品一覧、ブログ記事一覧）
    READ_ONLY: {
      staleTime: 60 * 60 * 1000, // 1時間
      gcTime: 24 * 60 * 60 * 1000, // 1日
    },
    // クリティカルなデータ（例：決済情報、セキュリティ関連）
    CRITICAL: {
      staleTime: 0,
      gcTime: 0, // キャッシュしない
    },
  };
  
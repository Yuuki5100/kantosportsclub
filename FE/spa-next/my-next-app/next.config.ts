import path from "path";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import webpack from "webpack";

const isStaticExport = process.env.NEXT_OUTPUT_MODE === "export";
const isDevelopment = process.env.NODE_ENV !== "production";
const isZapBaselineBuild =
  process.env.ZAP_BASELINE_BUILD === "1" ||
  process.env.ZAP_BASELINE_BUILD === "true";
const disableUnsafeEvalForSecurityScan =
  process.env.CSP_DISABLE_UNSAFE_EVAL === "1" ||
  process.env.CSP_DISABLE_UNSAFE_EVAL === "true";
const disableUnsafeInlineForSecurityScan =
  process.env.CSP_DISABLE_UNSAFE_INLINE === "1" ||
  process.env.CSP_DISABLE_UNSAFE_INLINE === "true";
const enableCrossOriginIsolationHeaders =
  process.env.CROSS_ORIGIN_ISOLATION_HEADERS === "1" ||
  process.env.CROSS_ORIGIN_ISOLATION_HEADERS === "true";

const toOrigin = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const toHostname = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

const uniqueSources = (sources: Array<string | null | undefined>): string[] =>
  [...new Set(sources.filter((source): source is string => Boolean(source)))];

const allowedDevOrigins = uniqueSources([
  toHostname(process.env.FRONTEND_ORIGIN),
  "frontend",
  "127.0.0.1",
]);

const connectSrc = uniqueSources([
  "'self'",
  toOrigin(process.env.NEXT_PUBLIC_API_BASE_URL),
  toOrigin(process.env.NEXT_PUBLIC_OTEL_HTTP_ENDPOINT),
  toOrigin(process.env.APPSERVER_URL),
  toOrigin(process.env.FRONTEND_ORIGIN),
  "http://localhost:8888",
  "http://localhost:8081",
  "ws://localhost:3000",
  "ws://127.0.0.1:3000",
  isDevelopment ? "ws://frontend:3000" : null,
]);

const imgSrc = uniqueSources([
  "'self'",
  "data:",
  "blob:",
  "https://www.j-ems.jp",
]);

const scriptSrc = uniqueSources([
  "'self'",
  !disableUnsafeInlineForSecurityScan ? "'unsafe-inline'" : null,
  isDevelopment && !disableUnsafeEvalForSecurityScan ? "'unsafe-eval'" : null,
  isDevelopment ? "blob:" : null,
]);

const styleSrc = uniqueSources([
  "'self'",
  !disableUnsafeInlineForSecurityScan ? "'unsafe-inline'" : null,
]);

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  `style-src ${styleSrc.join(" ")}`,
  `img-src ${imgSrc.join(" ")}`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "object-src 'none'",
];

if (!isDevelopment) {
  cspDirectives.push("upgrade-insecure-requests");
}

const contentSecurityPolicy = cspDirectives.join("; ");

/**
 * ✅ この設定の目的
 * - Next.js(3000) と Spring Boot(8081) 間で Cookie/JSESSIONID を共有
 * - 同一オリジン扱いにして CORS / SameSite 問題を回避
 * - ローカル開発中でもクロスドメインセッションを維持できるように
 */
const nextConfig: NextConfig = {
  // Disable Next.js signature header to reduce information disclosure.
  poweredByHeader: false,
  // Allow Docker service-name access to dev-only Next.js assets/endpoints.
  allowedDevOrigins,

  // ✅ 静的ビルド（nginx/CloudFront配信）時のみ export を有効化
  ...(isStaticExport ? { output: "export" as const } : {}),
  // ✅ 静的配信用ビルドでは成果物生成を優先（通常モードの厳格チェックは維持）
  eslint: {
    ignoreDuringBuilds: isStaticExport || isZapBaselineBuild,
  },
  typescript: {
    ignoreBuildErrors: isStaticExport || isZapBaselineBuild,
  },

  // ✅ デバッグ用ソースマップ有効化
  productionBrowserSourceMaps: true,

  // ✅ 外部画像ドメイン許可
  images: {
    domains: ["www.j-ems.jp"],
    unoptimized: true,
  },

  /**
   * ✅ rewrites
   * Next.js → Spring Boot へのAPIプロキシ
   * 同一オリジン扱いになるため、Cookie(JSESSIONID) が共有される
   */
  async rewrites() {
    if (isStaticExport) {
      return [];
    }
    return [
      // Spring Boot 側の /auth エンドポイントをNext経由で叩けるようにする
      {
        source: "/auth/:path*",
        destination: "http://localhost:8888/auth/:path*",
      },
      // 必要に応じて他APIも追加
      {
        source: "/api/:path*",
        destination: "http://localhost:8888/:path*",
      },
    ];
  },

  /**
   * ✅ headers
   * CORSヘッダの明示設定
   * Cookieを含むリクエストを許可するために必須
   */
  async headers() {
    if (isStaticExport) {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          ...(enableCrossOriginIsolationHeaders
            ? [
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin",
                },
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "require-corp",
                },
              ]
            : []),
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), fullscreen=(self)",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000", // ← フロントのオリジン
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true", // ← Cookie共有を許可
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Authorization, Content-Type, X-Requested-With, Accept, Origin",
          },
        ],
      },
    ];
  },

  /**
   * ✅ webpack設定
   * クライアント側で不要なモジュール（fs, winstonなど）を除外
   */
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...(config.resolve?.fallback ?? {}),
          fs: false,
        },
      };

      config.plugins = [
        ...(config.plugins ?? []),
        new webpack.IgnorePlugin({ resourceRegExp: /^fs$/ }), // ❌ fs モジュール無視
      ];

      // winston系のログ関連モジュールはクライアントバンドルから除外
      const additionalExternals = {
        winston: "commonjs winston",
        "winston-daily-rotate-file": "commonjs winston-daily-rotate-file",
        "file-stream-rotator": "commonjs file-stream-rotator",
      };

      config.externals = [
        ...(Array.isArray(config.externals)
          ? config.externals
          : config.externals
          ? [config.externals]
          : []),
        additionalExternals,
      ];
    }

    // ✅ ここから追加（source map のパスを相対にする）
    config.output = {
      ...config.output,
      devtoolModuleFilenameTemplate: (info) =>
        path
          .relative(__dirname, info.absoluteResourcePath)
          .replace(/\\/g, "/"), // Windows対応
    };

    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@": path.resolve(__dirname, "src"),
        "@components": path.resolve(__dirname, "src/components"),
        "@composite": path.resolve(__dirname, "src/components/composite"),
        "@base": path.resolve(__dirname, "src/components/base"),
        "@functional": path.resolve(__dirname, "src/components/functional"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@api": path.resolve(__dirname, "src/api"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@config": path.resolve(__dirname, "src/config"),
        "@types": path.resolve(__dirname, "src/types"),
        "@slices": path.resolve(__dirname, "src/slices"),
      },
    };

    return config;
  },
};

export default nextConfig;

package com.example.appserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.*;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

// @Configuration
public class CorsConfig {

    // @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ ---- 許可するオリジン（React / Vite / Mockサーバー）----
        // * addAllowedOriginPattern("*") を使う場合は setAllowedOrigins() は併用しないのがベストプラクティス
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173", // Vite
                "http://localhost:3000", // React
                "http://localhost:4000", // モックサーバー
                "http://localhost:8081"  // 自アプリ（内部呼び出し用）
        ));

        // ✅ ---- Cookie共有を有効化 ----
        // これがないとブラウザが "SameSite=Lax" の制約でCookieを送らない
        configuration.setAllowCredentials(true);

        // ✅ ---- 許可するHTTPメソッド ----
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // ✅ ---- 許可するヘッダー ----
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Cache-Control",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin"
        ));

        // ✅ ---- Exposeヘッダー（クライアント側で読み取れるヘッダーを指定）----
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Set-Cookie"
        ));

        // ✅ ---- キャッシュの最大時間（プリフライト要求の再利用時間）----
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * ✅ Spring Security が CORS を SecurityFilterChain 前で処理できるように
     */
    // @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }
}

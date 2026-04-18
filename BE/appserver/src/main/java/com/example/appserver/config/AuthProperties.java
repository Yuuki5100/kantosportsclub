package com.example.appserver.config;

import com.example.servercommon.message.BackendMessageCatalog;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Slf4j
@Data
@Component
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {

    /** 現在の認証タイプ (gbiz or internal) */
    private String type;

    /** GビズIDモック用設定 */
    private Provider gbiz;

    /** 社内認証用設定 */
    private Provider internal;

    /** Cookie設定。未設定でもデフォルト値で動作させる */
    private Cookie cookie = new Cookie();

    /**
     * 起動時の確認ログ（必要なときだけ出す）
     * - URLなどは環境によっては出したくないので debug に寄せる
     */
    @PostConstruct
    public void debug() {
        if (!log.isDebugEnabled()) return;

        log.debug(BackendMessageCatalog.LOG_AUTH_PROPERTIES_SEPARATOR);
        log.debug(BackendMessageCatalog.LOG_AUTH_PROPERTIES_BEAN_ID, System.identityHashCode(this));
        log.debug(BackendMessageCatalog.LOG_AUTH_PROPERTIES_CONTEXT, this.getClass().getClassLoader());
        log.debug(BackendMessageCatalog.LOG_AUTH_TYPE, type);
        log.debug(BackendMessageCatalog.LOG_AUTH_GBIZ_URL, gbiz != null ? gbiz.getAuthUrl() : "null");
        log.debug(BackendMessageCatalog.LOG_AUTH_INTERNAL_URL, internal != null ? internal.getAuthUrl() : "null");
        log.debug(BackendMessageCatalog.LOG_AUTH_PROPERTIES_SEPARATOR);
    }

    /**
     * 認証タイプに応じてURLを動的に切り替える
     * ※ configは値保持に寄せるなら、将来的にResolverへ移す候補
     */
    public String getAuthUrl() {
        if ("internal".equalsIgnoreCase(type) && internal != null) {
            return internal.getAuthUrl();
        } else if ("gbiz".equalsIgnoreCase(type) && gbiz != null) {
            return gbiz.getAuthUrl();
        }
        throw new IllegalStateException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_AUTH_CONFIGURATION, type));
    }

    /**
     * トークンURLも同様に切り替え
     * ※ configは値保持に寄せるなら、将来的にResolverへ移す候補
     */
    public String getTokenUrl() {
        if ("internal".equalsIgnoreCase(type) && internal != null) {
            return internal.getTokenUrl();
        } else if ("gbiz".equalsIgnoreCase(type) && gbiz != null) {
            return gbiz.getTokenUrl();
        }
        throw new IllegalStateException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_INVALID_TOKEN_CONFIGURATION, type));
    }

    @Data
    public static class Cookie {
        private boolean secure = true;
        private String sameSite = "Lax";
        private String accessPath = "/api";
        private String refreshPath = "/api/auth/refresh";
    }

    @Data
    public static class Provider {
        private String authUrl;
        private String tokenUrl;
    }
}

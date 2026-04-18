package com.example.servercommon.setting;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "system.setting.cache")
public class SystemSettingCacheProperties {

    /**
     * 動的設定キャッシュを有効化するか。
     */
    private boolean enabled = true;

    /**
     * キャッシュTTL（秒）。0以下の場合は無期限。
     */
    private long ttlSeconds = 300;

    /**
     * キャッシュ最大件数。
     */
    private int maxEntries = 512;
}

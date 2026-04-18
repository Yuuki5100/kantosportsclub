package com.example.servercommon.config;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public abstract class GenericCache<T> implements CacheReloadable<T> {

    private Map<String, List<T>> cache = new HashMap<>();

    // DBからデータを取得し、キャッシュを再構築する処理
    @Override
    public void reloadCache(String key,List<T> items) {
        // キャッシュをクリアする
        cache.clear();
        // 受け取ったデータをキャッシュに保存する
        cache.put(key, items);
    }

    // キャッシュを取得するメソッド
    @Override
    public Object getCache(String key) {
        return cache.get(key);
    }
}

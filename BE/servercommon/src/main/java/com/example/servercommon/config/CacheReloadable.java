package com.example.servercommon.config;

import java.util.List;

import org.apache.poi.ss.formula.functions.T;

public interface CacheReloadable<T> {
    void reloadCache(String key, List<T> items);
    Object getCache(String key);
}

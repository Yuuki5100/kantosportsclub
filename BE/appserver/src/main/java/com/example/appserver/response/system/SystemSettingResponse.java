package com.example.appserver.response.system;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SystemSettingResponse<T> {
    private String result;
    private int message;
    private String args;
    private T data;

    public static <T> SystemSettingResponse<T> ok(T data) {
        return new SystemSettingResponse<>("OK", 200, "", data);
    }

    public static <T> SystemSettingResponse<T> failed(int status, String args) {
        return new SystemSettingResponse<>("Failed", status, args, null);
    }
}

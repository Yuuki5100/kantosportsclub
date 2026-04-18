package com.example.appserver.response.manual;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualApiResponse<T> {
    private String result;
    private int statusCode;
    private String args;
    private T data;

    public static <T> ManualApiResponse<T> ok(int statusCode, T data) {
        return new ManualApiResponse<>("OK", statusCode, null, data);
    }

    public static <T> ManualApiResponse<T> clientError(int statusCode, String args) {
        return new ManualApiResponse<>("Client Error", statusCode, args, null);
    }

    public static <T> ManualApiResponse<T> serverError(int statusCode) {
        return new ManualApiResponse<>("Server Error", statusCode, null, null);
    }

    public static <T> ManualApiResponse<T> failed(int statusCode, String args) {
        return new ManualApiResponse<>("Failed", statusCode, args, null);
    }
}

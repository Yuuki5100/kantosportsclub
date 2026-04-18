package com.example.appserver.request.admin;

import lombok.Data;

import java.util.Map;

@Data
public class PreviewRequest {
    private String templateName;
    private String locale;
    private Map<String, Object> dummyVariables;
}

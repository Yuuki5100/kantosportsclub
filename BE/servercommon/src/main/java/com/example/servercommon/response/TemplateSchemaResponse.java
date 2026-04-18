package com.example.servercommon.response;

import java.util.Map;

import com.example.servercommon.validationtemplate.schema.TemplateSchema;

public class TemplateSchemaResponse {
    private boolean success;
    private Map<String, TemplateSchema> data;

    public TemplateSchemaResponse(boolean success, Map<String, TemplateSchema> data) {
        this.success = success;
        this.data = data;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public Map<String, TemplateSchema> getData() { return data; }
    public void setData(Map<String, TemplateSchema> data) { this.data = data; }
}

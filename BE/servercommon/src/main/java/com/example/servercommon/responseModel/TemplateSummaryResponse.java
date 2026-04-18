package com.example.servercommon.responseModel;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TemplateSummaryResponse {
    private String templateName;
    private String locale;
}

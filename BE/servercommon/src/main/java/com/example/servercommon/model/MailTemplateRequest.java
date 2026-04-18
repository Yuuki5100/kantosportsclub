package com.example.servercommon.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class MailTemplateRequest {
    private String body;
    private String locale;
    private String subject;
    private String templateName;
}

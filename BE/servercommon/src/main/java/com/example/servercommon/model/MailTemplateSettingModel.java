package com.example.servercommon.model;

import com.example.servercommon.model.MailTemplateId;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "mail_templates")
@IdClass(MailTemplateId.class)
@Data
public class MailTemplateSettingModel {

    @Id
    private String templateName;

    private String locale;

    private String subject;

    private String body;

}

package com.example.servercommon.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@IdClass(MailTemplateId.class)
@Table(name = "mail_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MailTemplateEntity {

    @Id
    private String templateName;

    @Id
    private String locale;

    @Column(nullable = false)
    private String subject;

    @Lob
    @Column(nullable = false)
    private String body;
}

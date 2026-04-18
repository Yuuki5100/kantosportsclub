package com.example.servercommon.repository;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.model.MailTemplateId;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface MailTemplateRepository extends JpaRepository<MailTemplateEntity, MailTemplateId> {

    Optional<MailTemplateEntity> findByTemplateNameAndLocale(String templateName, String locale);

    List<MailTemplateEntity> findAllByTemplateName(String templateName);
}

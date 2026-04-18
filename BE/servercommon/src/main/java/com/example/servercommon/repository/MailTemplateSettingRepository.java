package com.example.servercommon.repository;

import com.example.servercommon.model.MailTemplateSettingModel;
import com.example.servercommon.model.MailTemplateId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MailTemplateSettingRepository extends JpaRepository<MailTemplateSettingModel, MailTemplateId> {
    // 必要に応じてカスタムメソッドを定義できます
}

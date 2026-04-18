package com.example.appserver.cache;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.servercommon.config.GenericCache;
import com.example.servercommon.model.MailTemplateSettingModel;
import com.example.servercommon.repository.MailTemplateSettingRepository;

import lombok.AllArgsConstructor;

// キャッシュ取得機能を提供するクラス
// 本来は、別ファイルに外だしして記載すべきだが可読性を上げるため当クラスに記載
@AllArgsConstructor
@Component
public class MailTemplateCache extends GenericCache<MailTemplateSettingModel> {
    @Autowired
    private MailTemplateSettingRepository mailTemplateSettingRepository;

    // キャッシュを更新する
    public void updateCache() {
        // DBからデータを全権取得する
        List<MailTemplateSettingModel> mailtemplatesList = mailTemplateSettingRepository.findAll();
        super.reloadCache("mailTemplates", mailtemplatesList);
    }

    // メールテンプレートのキャッシュを取得する
    public List<MailTemplateSettingModel> getCache() {
        // キャストして値を返す
        return (List<MailTemplateSettingModel>)super.getCache("mailTemplates");
    }
}

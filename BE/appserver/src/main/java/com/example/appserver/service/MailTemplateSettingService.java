package com.example.appserver.service;

import com.example.appserver.cache.MailTemplateCache;
import com.example.servercommon.model.MailTemplateId;
import com.example.servercommon.model.MailTemplateRequest;
import com.example.servercommon.model.MailTemplateSettingModel;
import com.example.servercommon.repository.MailTemplateSettingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MailTemplateSettingService {

    @Autowired
    private MailTemplateSettingRepository mailTemplateSettingRepository;

    @Autowired
    private MailTemplateCache mailTemplateCache;

    /**
     * 全件取得
     */
    public List<MailTemplateSettingModel> findAll() {
        List<MailTemplateSettingModel> result = mailTemplateCache.getCache();
        return result;
    }

    /**
     * Insert または Update（save は両方対応）
     */
    public MailTemplateSettingModel saveOrUpdate(MailTemplateSettingModel template) {
        MailTemplateSettingModel updateModel = mailTemplateSettingRepository.save(template);
        // キャッシュを更新する
        // mailTemplateCache.updateCache();
        // 更新したレコードを返す
        return updateModel;
    }

    /**
     * 更新（templateName + locale を検索条件）
     */
    public Optional<MailTemplateSettingModel> updateTemplate(String templateName, MailTemplateRequest request) {
        // 検索条件（複合キー）を設定する
        MailTemplateId id = new MailTemplateId(templateName, request.getLocale());
        // 検索条件（複合キー）を元に検索する
        Optional<MailTemplateSettingModel> optional = mailTemplateSettingRepository.findById(id);
        // 検索結果が存在する場合
        if (optional.isPresent()) {
            // 更新対象レコードがあることを確認した上で、更新処理を行う
            MailTemplateSettingModel template = optional.get();
            template.setSubject(request.getSubject());
            template.setBody(request.getBody());
            Optional<MailTemplateSettingModel> updatemodel = Optional.of(mailTemplateSettingRepository.save(template));
            // キャッシュの更新を行う
            mailTemplateCache.updateCache();
            // 更新対象のレコードを返す
            return updatemodel;
        } else {
            // 更新対象が無いため、空のOptionalを返す
            return Optional.empty();
        }
    }

    /**
     * テンプレート文字列の変数置換 (例: {{name}} → "John") ※現在未使用
     */
    public String renderTemplate(String template, Map<String, String> variables) {
        if (template == null || variables == null)
            return template;

        Pattern pattern = Pattern.compile("\\{\\{\\s*(\\w+)\\s*}}");
        Matcher matcher = pattern.matcher(template);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String key = matcher.group(1);
            String value = variables.getOrDefault(key, "");
            matcher.appendReplacement(sb, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}

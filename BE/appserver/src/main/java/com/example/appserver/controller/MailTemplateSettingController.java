package com.example.appserver.controller;

import com.example.servercommon.model.MailTemplateRequest;
import com.example.servercommon.model.MailTemplateSettingModel;
import com.example.appserver.cache.MailTemplateCache;
import com.example.appserver.service.MailTemplateSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("mail-templates")
public class MailTemplateSettingController {

    @Autowired
    private MailTemplateSettingService mailTemplateService;
    @Autowired
    private MailTemplateCache mailTemplateCache;

    /**
     * 全テンプレート取得
     * GET /mail-templates
     */
    @GetMapping
    public List<MailTemplateSettingModel> getAllTemplates() {
        return mailTemplateService.findAll();
    }

    /**
     * テンプレート更新（templateName）
     * PUT /mail-templates/{templateName}
     */
    @PutMapping("/{templateName}")
    public ResponseEntity<MailTemplateSettingModel> updateTemplate(
            @PathVariable("templateName") String templateName,
            @RequestBody MailTemplateRequest request) {
        Optional<MailTemplateSettingModel> updated = mailTemplateService.updateTemplate(templateName, request);
        return updated.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * テンプレートのリロード
     * POST /mail-templates/reload
     */
    @PostMapping("/reload")
    public void reloadTemplates() {
        // 本来はキャッシュなどの再読込処理
        mailTemplateCache.updateCache();
    }
}

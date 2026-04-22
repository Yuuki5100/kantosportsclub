package com.example.appserver.controller;

import com.example.appserver.request.admin.PreviewRequest;
import com.example.appserver.service.MailPreviewService;
import com.example.appserver.service.MailTemplateQueryService;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.PreviewResponse;
import com.example.servercommon.responseModel.TemplateSummaryResponse;
import com.example.servercommon.template.MailTemplateRegistry;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/templates")
@RequiredArgsConstructor
public class MailTemplateAdminController {

    private final MailPreviewService mailPreviewService;
    private final MailTemplateRegistry mailTemplateRegistry;
    private final MailTemplateQueryService mailTemplateQueryService;

    @PostMapping("/preview")
    public ApiResponse<PreviewResponse> preview(@RequestBody PreviewRequest request) {
        try {
            String body = mailPreviewService.renderBody(
                    request.getTemplateName(),
                    request.getLocale(),
                    request.getDummyVariables()
            );
            String subject = mailPreviewService.getSubject(
                    request.getTemplateName(),
                    request.getLocale()
            );
            return ApiResponse.success(new PreviewResponse(subject, body));
        } catch (Exception e) {
            return ApiResponse.error(BackendMessageCatalog.CODE_TEMPLATE_PREVIEW_FAILED, e.getMessage());
        }
    }

    @PostMapping("/reload")
    public ApiResponse<String> reload() {
        mailTemplateRegistry.reload();
        return ApiResponse.success(BackendMessageCatalog.MSG_TEMPLATE_CACHE_RELOADED);
    }

    @GetMapping
    public ApiResponse<List<TemplateSummaryResponse>> listTemplates() {
        List<TemplateSummaryResponse> list = mailTemplateQueryService.getAllSummaries();
        return ApiResponse.success(list);
    }
}

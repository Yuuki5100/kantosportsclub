package com.example.appserver.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.repository.ReportMasterRepository;
import com.example.servercommon.responseModel.ApiResponse;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class ReportAdminController {

    private final ReportDefinitionLoader reportDefinitionLoader;
    private final ReportMasterRepository reportMasterRepository;

    @PostMapping("/{reportId}/reload")
    public ResponseEntity<ApiResponse<String>> reloadCache(@PathVariable Long reportId) {
        reportDefinitionLoader.reload(reportId);
        return ResponseEntity.ok(new ApiResponse<>(true, "キャッシュ更新完了: " + reportId, null));
    }

    @GetMapping("/cache-status")
    public ResponseEntity<ApiResponse<Boolean>> isCacheEnabled() {
        boolean enabled = reportDefinitionLoader.isCacheEnabled();
        return ResponseEntity.ok(new ApiResponse<>(true, enabled, null));
    }

    /** ✳️ 全帳票のキャッシュをリロードする */
    @PostMapping("/cache/reload")
    public ResponseEntity<ApiResponse<String>> reloadAllReportDefinitions() {
        if (!reportDefinitionLoader.isCacheEnabled()) {
            return ResponseEntity.ok(ApiResponse.success("キャッシュは無効化されています。"));
        }

        List<ReportMaster> allReports = reportMasterRepository.findAll();
        for (ReportMaster report : allReports) {
            reportDefinitionLoader.reload(report.getReportId());
        }

        return ResponseEntity.ok(ApiResponse.success("全帳票キャッシュのリロードが完了しました。"));
    }

}

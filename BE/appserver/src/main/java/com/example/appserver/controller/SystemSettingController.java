package com.example.appserver.controller;

import com.example.appserver.request.system.SystemSettingUpdateRequest;
import com.example.appserver.response.system.SystemSettingData;
import com.example.appserver.response.system.SystemSettingResponse;
import com.example.appserver.security.RequirePermission;
import com.example.appserver.service.SystemSettingService;
import com.example.servercommon.model.SystemSetting;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public SystemSettingController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @GetMapping
    @RequirePermission(permissionId = 3, statusLevelId = 2) // SYSTEM_SETTINGS, 参照
    public ResponseEntity<SystemSettingResponse<SystemSettingData>> get() {
        Optional<SystemSetting> settingOpt = systemSettingService.getCurrent();
        if (settingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(SystemSettingResponse.failed(404, "system_setting"));
        }
        SystemSettingData data = systemSettingService.toResponseData(settingOpt.get());
        return ResponseEntity.ok(SystemSettingResponse.ok(data));
    }

    @PutMapping
    @RequirePermission(permissionId = 3, statusLevelId = 3) // SYSTEM_SETTINGS, 更新
    public ResponseEntity<SystemSettingResponse<SystemSettingData>> update(
            @RequestBody SystemSettingUpdateRequest request) {
        String arg = validate(request);
        if (arg != null) {
            return ResponseEntity.badRequest().body(SystemSettingResponse.failed(400, arg));
        }

        SystemSetting updated = systemSettingService.upsert(request);
        SystemSettingData data = systemSettingService.toResponseData(updated);
        return ResponseEntity.ok(SystemSettingResponse.ok(data));
    }

    private String validate(SystemSettingUpdateRequest request) {
        if (request == null) return "request";
        if (!isInRange(request.getPasswordValidDays(), 1, 360)) return "passwordValidDays";
        if (!isInRange(request.getPasswordReissueUrlExpiration(), 1, 7)) return "passwordReissueUrlExpiration";
        if (!isInRange(request.getNumberOfRetries(), 1, 20)) return "numberOfRetries";
        if (!isInRange(request.getNumberOfNotices(), 1, 100)) return "numberOfNotices";
        return null;
    }

    private boolean isInRange(Integer value, int min, int max) {
        if (value == null) return false;
        return value >= min && value <= max;
    }
}

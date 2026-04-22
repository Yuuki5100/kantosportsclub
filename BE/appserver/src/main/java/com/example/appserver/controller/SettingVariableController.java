package com.example.appserver.controller;

import com.example.appserver.response.system.SystemSettingResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class SettingVariableController {

    /**
     * Deprecated: use GET /api/system
     */
    @GetMapping
    public ResponseEntity<SystemSettingResponse<Void>> getAllSettings() {
        return ResponseEntity.status(410).body(SystemSettingResponse.failed(410, "/api/system"));
    }

    /**
     * Deprecated: use PUT /api/system
     */
    @PutMapping
    public ResponseEntity<SystemSettingResponse<Void>> updateSetting(@RequestBody Object setting) {
        return ResponseEntity.status(410).body(SystemSettingResponse.failed(410, "/api/system"));
    }

    /**
     * Deprecated: use PUT /api/system
     */
    @PostMapping("/reload")
    public ResponseEntity<SystemSettingResponse<Void>> reloadSettings() {
        return ResponseEntity.status(410).body(SystemSettingResponse.failed(410, "/api/system"));
    }
}

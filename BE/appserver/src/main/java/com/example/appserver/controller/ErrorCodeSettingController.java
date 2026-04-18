package com.example.appserver.controller;

import com.example.servercommon.model.ErrorCodeSettingModel;
import com.example.servercommon.model.ErrorCodeUpdateRequest;
import com.example.appserver.cache.ErrorCodeCache;
import com.example.appserver.service.ErrorCodeSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("error-codes")
public class ErrorCodeSettingController {

    @Autowired
    private ErrorCodeSettingService errorCodeService;

    @Autowired
    private ErrorCodeCache errorCodeCache;

    /**
     * 全エラーコードを取得
     * GET /error-codes
     */
    @GetMapping
    public List<ErrorCodeSettingModel> getAllErrorCodes() {
        return errorCodeService.findAll();
    }

    /**
     * 新しいエラーコードを登録または更新
     * POST /error-codes
     */
    @PostMapping
    public ResponseEntity<ErrorCodeSettingModel> createOrUpdateErrorCode(@RequestBody ErrorCodeSettingModel errorCode) {
        ErrorCodeSettingModel result = errorCodeService.saveOrUpdate(errorCode);
        return ResponseEntity.ok(result);
    }

    /**
     * 指定されたコードとロケールのエラーコードを更新
     * PUT /error-codes/{code}?locale=xx
     */
    @PutMapping("/{code}")
    public ResponseEntity<ErrorCodeSettingModel> updateErrorCodeMessage(
            @PathVariable("code") String code,
            @RequestBody ErrorCodeUpdateRequest request) {

        Optional<ErrorCodeSettingModel> updated = errorCodeService.updateMessage(code, request.getLocale(),
                request.getMessage());

        return updated.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * エラーコードのリロード（処理は仮）
     * POST /error-codes/reload
     */
    @PostMapping("/reload")
    public void reloadErrorCodes() {
        // キャッシュの更新を行う
        errorCodeCache.updateCache();
    }
}

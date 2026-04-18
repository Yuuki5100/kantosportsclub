package com.example.appserver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appserver.request.batchresult.SampleJobInstanceRequest;
import com.example.appserver.service.CustomJobInstanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Spring Batch の JOB_INSTANCE テーブル構成に新たなカラム（ERROR_DISPLAY_TYPE）を追加したため、
 * デフォルトのエンティティでは対応できなくなりました。
 *
 * 本コントローラーは、構造変更後の JOB_INSTANCE テーブルにデータを登録するための
 * サンプル API を提供する目的で実装されたものです。
 *
 * 実運用で使用する際は、要件に応じてバリデーションや例外処理の強化が必要です。
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/system-transfer/custom-job-instance")
public class CustomJobInstanceController {
    private final CustomJobInstanceService service;

    @PostMapping("/apply")
    public ResponseEntity<Void> apply(@RequestBody SampleJobInstanceRequest request) {
        service.apply(request);
        return ResponseEntity.ok().build();
    }
}

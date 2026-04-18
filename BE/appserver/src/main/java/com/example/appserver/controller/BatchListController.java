package com.example.appserver.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appserver.request.batchresult.BaseListRequest;
import com.example.appserver.service.BatchListService;
import com.example.servercommon.response.BatchResponse;
import com.example.servercommon.response.batchresult.BaseListQueryResult;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.responseModel.base.CommonListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * バッチ処理結果一覧APi.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/system-transfer/batch-list")
public class BatchListController {

    /**
     * バッチ処理結果一覧service
     */
    private final BatchListService service;

    /**
     * バッチ処理結果一覧取得.
     *
     * @param request request
     * @return バッチ処理結果リスト
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CommonListResponse<BaseListQueryResult>>> getBaseList(
        @ModelAttribute BaseListRequest request) {
        CommonListResponse<BaseListQueryResult> resList = service.getBaseList(request);
        ApiResponse<CommonListResponse<BaseListQueryResult>> apiResponse =
            ApiResponse.success(resList);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/names")
    public ResponseEntity<ApiResponse<List<BatchResponse>>> getBatchNameList() {
        List<BatchResponse> result = service.getBatchNameList();
        ApiResponse<List<BatchResponse>> apiResponse = ApiResponse.success(result);
        return ResponseEntity.ok(apiResponse);
    }
}

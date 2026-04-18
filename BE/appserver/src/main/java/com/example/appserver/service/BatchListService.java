package com.example.appserver.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.appserver.request.batchresult.BaseListRequest;
import com.example.servercommon.enums.BatchInfo;
import com.example.servercommon.mapper.BatchListMapper;
import com.example.servercommon.model.BaseListParam;
import com.example.servercommon.model.ErrorMessageCode;
import com.example.servercommon.response.BatchResponse;
import com.example.servercommon.response.batchresult.BaseListQueryResult;
import com.example.servercommon.responseModel.base.CommonListResponse;
import com.example.servercommon.service.ErrorCodeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchListService {
    /**
     * バッチ処理結果一覧Mapper
     */
    private final BatchListMapper batchListMapper;

     private final ErrorCodeService errorCodeService;

    /**
     * バッチ処理結果一覧.
     *
     * @param request request
     * @return バッチ結果リスト
     */
    @Transactional(readOnly = true)
    public CommonListResponse<BaseListQueryResult> getBaseList(BaseListRequest request) {
        BaseListParam param = new BaseListParam();
        BeanUtils.copyProperties(request, param);
        CommonListResponse<BaseListQueryResult> response = batchListMapper.getMappedBatchList(param);
        List<String> predefinedMessages = new ArrayList<>();
        predefinedMessages.add(errorCodeService.getErrorMessage(ErrorMessageCode.UNEXPECTED_ERROR, Locale.JAPAN.getLanguage()));
        predefinedMessages.add(errorCodeService.getErrorMessage(ErrorMessageCode.ACTUAL_UNLOAD_AMOUNT_EXCEEDS_CAPACITY, Locale.JAPAN.getLanguage()));
        predefinedMessages.add(errorCodeService.getErrorMessage(ErrorMessageCode.REPORT_DATA_FETCH_FAILED, Locale.JAPAN.getLanguage()));
        List<BaseListQueryResult> results = response.getValue();
        if (results != null) {
            for (BaseListQueryResult result : results) {
                String rawError = result.getErrorMessege();
                if (rawError != null) {
                    for (String predefined : predefinedMessages) {
                        if (rawError.contains(predefined)) {
                            result.setErrorMessege(predefined);
                            break;
                        }
                    }
                }
            }
        }
        return response;
    }

    /**
     * バッチ名一覧を取得する（Enumから）
     */
    public List<BatchResponse> getBatchNameList() {
        return Arrays.stream(BatchInfo.values())
                     .map(e -> new BatchResponse(e.getBatchName(), e.getDisplayName()))
                     .collect(Collectors.toList());
    }

}

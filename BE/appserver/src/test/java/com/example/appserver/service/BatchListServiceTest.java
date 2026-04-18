package com.example.appserver.service;

import com.example.appserver.request.batchresult.BaseListRequest;
import com.example.servercommon.enums.BatchInfo;
import com.example.servercommon.mapper.BatchListMapper;
import com.example.servercommon.model.BaseListParam;
import com.example.servercommon.model.ErrorMessageCode;
import com.example.servercommon.response.BatchResponse;
import com.example.servercommon.response.batchresult.BaseListQueryResult;
import com.example.servercommon.responseModel.base.CommonListResponse;
import com.example.servercommon.service.ErrorCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BatchListServiceTest {

    private BatchListMapper batchListMapper;
    private ErrorCodeService errorCodeService;
    private BatchListService service;

    @BeforeEach
    void setUp() {
        batchListMapper = mock(BatchListMapper.class);
        errorCodeService = mock(ErrorCodeService.class);
        service = new BatchListService(batchListMapper, errorCodeService);
    }

    @Test
    void getBaseList_ShouldMapErrorsCorrectly() {
        BaseListRequest request = new BaseListRequest();
        BaseListQueryResult queryResult = new BaseListQueryResult();
        queryResult.setErrorMessege("Unexpected error occurred in process");

        CommonListResponse<BaseListQueryResult> mapperResponse = new CommonListResponse<>();
        mapperResponse.setValue(Collections.singletonList(queryResult));

        when(batchListMapper.getMappedBatchList(any(BaseListParam.class))).thenReturn(mapperResponse);
        when(errorCodeService.getErrorMessage(ErrorMessageCode.UNEXPECTED_ERROR, "ja")).thenReturn("Unexpected error occurred in process");
        when(errorCodeService.getErrorMessage(ErrorMessageCode.ACTUAL_UNLOAD_AMOUNT_EXCEEDS_CAPACITY, "ja")).thenReturn("Unload exceeds capacity");
        when(errorCodeService.getErrorMessage(ErrorMessageCode.REPORT_DATA_FETCH_FAILED, "ja")).thenReturn("Report fetch failed");

        CommonListResponse<BaseListQueryResult> response = service.getBaseList(request);

        assertNotNull(response);
        assertEquals(1, response.getValue().size());
        assertEquals("Unexpected error occurred in process", response.getValue().get(0).getErrorMessege());

        // Mapper が呼ばれたか確認
        ArgumentCaptor<BaseListParam> paramCaptor = ArgumentCaptor.forClass(BaseListParam.class);
        verify(batchListMapper).getMappedBatchList(paramCaptor.capture());
        assertNotNull(paramCaptor.getValue());
    }

    @Test
    void getBaseList_ShouldHandleNullErrorsGracefully() {
        BaseListRequest request = new BaseListRequest();
        BaseListQueryResult queryResult = new BaseListQueryResult();
        queryResult.setErrorMessege(null); // エラーが null の場合

        CommonListResponse<BaseListQueryResult> mapperResponse = new CommonListResponse<>();
        mapperResponse.setValue(Collections.singletonList(queryResult));

        when(batchListMapper.getMappedBatchList(any(BaseListParam.class))).thenReturn(mapperResponse);
        when(errorCodeService.getErrorMessage(any(), anyString())).thenReturn("Some error");

        CommonListResponse<BaseListQueryResult> response = service.getBaseList(request);

        assertNotNull(response);
        assertEquals(1, response.getValue().size());
        assertNull(response.getValue().get(0).getErrorMessege()); // null のまま
    }

    @Test
    void getBatchNameList_ShouldReturnAllBatchInfo() {
        List<BatchResponse> batchList = service.getBatchNameList();
        assertEquals(BatchInfo.values().length, batchList.size());

        for (int i = 0; i < BatchInfo.values().length; i++) {
            assertEquals(BatchInfo.values()[i].getBatchName(), batchList.get(i).getBatchName());
            assertEquals(BatchInfo.values()[i].getDisplayName(), batchList.get(i).getDisplayName());
        }
    }
}

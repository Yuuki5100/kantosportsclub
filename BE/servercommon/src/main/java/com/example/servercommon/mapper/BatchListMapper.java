package com.example.servercommon.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.servercommon.dto.BaseListDto;
import com.example.servercommon.enums.BatchInfo;
import com.example.servercommon.mapper.base.CommonIBasePagingMapper;
import com.example.servercommon.mapper.responsemapper.BatchListResponseMapper;
import com.example.servercommon.model.BaseListParam;
import com.example.servercommon.response.batchresult.BaseListQueryResult;
import com.example.servercommon.responseModel.base.CommonListResponse;



@Mapper
public interface BatchListMapper extends CommonIBasePagingMapper{

    // raw SQL-mapped list
    List<BaseListDto> getBatchList(@Param("param") BaseListParam param);

    // mapped + paginated response
    default CommonListResponse<BaseListQueryResult> getMappedBatchList(BaseListParam param) {
        CommonListResponse<BaseListQueryResult> response = new CommonListResponse<>();
        selectWithPage(
            param,
            response,
            dto -> {
                BaseListQueryResult result = BatchListResponseMapper.INSTANCE.toBatchListQueryResult(dto);
                result.setBatchName(BatchInfo.getDisplayNameByBatchName(result.getBatchName()));
                return result;
            },
            this::getBatchList
        );
        return response;
    }

}

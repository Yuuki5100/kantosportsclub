package com.example.servercommon.mapper.responsemapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

import com.example.servercommon.dto.BaseListDto;
import com.example.servercommon.response.batchresult.BaseListQueryResult;
import org.mapstruct.Builder;
/**
 * バッチ処理結果一覧Mapper
 */
@Mapper
public interface BatchListResponseMapper {

    BatchListResponseMapper INSTANCE = Mappers.getMapper(BatchListResponseMapper.class);
    /**
     * バッチ結果一覧データ変換.
     *
     * @param dto バッチ一覧DTO
     * @return バッチ結果一覧レスポンスデータ
     */
    @Mappings({
        @Mapping(source = "baseCd", target = "baseCd"),
        @Mapping(source = "baseName", target = "baseName"),
        @Mapping(source = "batchName", target = "batchName"),
        @Mapping(source = "startDateAndTime", target = "startDateAndTime"),
        @Mapping(source = "endDateAndTime", target = "endDateAndTime"),
        @Mapping(source = "statusName", target = "statusName"),
        @Mapping(source = "errorMessege", target = "errorMessege") // ✅ match both source & target
    })
    BaseListQueryResult toBatchListQueryResult(BaseListDto dto);
}

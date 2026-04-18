package com.example.servercommon.mapper.base;

import java.util.List;
import java.util.function.Function;

import com.example.servercommon.model.base.CommonAbstractBaseCondition;
import com.example.servercommon.responseModel.base.CommonListResponse;
import com.github.pagehelper.Page;
import com.github.pagehelper.page.PageMethod;

public interface CommonIBasePagingMapper {
    default <E, C extends CommonAbstractBaseCondition, R> List<R> selectWithPage(
        C condition, CommonListResponse<R> response, Function<E, R> convert,
        Function<C, List<E>> select) {

        // 総データ
        try (Page<E> dataPage = PageMethod.startPage(condition.getPageNo(),
            condition.getPageSize()).doSelectPage(() -> select.apply(condition))) {
            List<R> dataList = dataPage.getResult().stream().map(convert).toList();
            long total = dataPage.getTotal();
            response.setTotal(total);
            response.setValue(dataList);
            return dataList;
        }
    }

}

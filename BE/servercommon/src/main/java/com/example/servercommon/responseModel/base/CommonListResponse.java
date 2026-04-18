package com.example.servercommon.responseModel.base;

import java.util.List;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CommonListResponse<T> {

    /**
     * 一覧情報.
     */
    private List<T> value;

    /**
     * 全件数.
     */
    private long total;

}


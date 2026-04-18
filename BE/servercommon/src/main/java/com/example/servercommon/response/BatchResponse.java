package com.example.servercommon.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 処理結果一覧画面のバッチ名コンボボックスに使用できるDTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchResponse {
    private String batchName; // バッチ物理名
    private String displayName; // バッチ日本語名
}

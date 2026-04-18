package com.example.servercommon.responseModel;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * WebSocket や他の通知チャネルで使用する汎用通知イベントモデル。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotifyQueueEvent {

    /**
     * 通知イベント種別（例: GATE_IN, GATE_OUT, REPORT_READY）
     */
    private String eventType;

    /**
     * 関連リソースの参照ID（例: gate_event.id や report.id）
     */
    private Long refId;

    /**
     * 必要に応じて補足情報を含める汎用メタデータ（任意）
     */
    private Map<String, Object> metadata;

    /**
     * 作成日時
     */
    private LocalDateTime createdAt;


}

package com.example.servercommon.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * テンプレートメール送信用のモデル
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailMessage {

    /**
     * 宛先メールアドレス
     */
    private String to;

    /**
     * メール件名
     */
    private String subject;

    /**
     * HTML本文（テンプレートエンジンでレンダリング済み）
     * ※テンプレートを使用しない場合は直接セットする
     */
    private String htmlBody;

    /**
     * テンプレート名（例：login, welcome）
     */
    private String templateName;

    /**
     * テンプレート埋め込み変数（例：{username: "Taro", loginUrl: "..."})
     */
    private Map<String, Object> templateVariables;

    /** ← 追加: ロケール（ja, enなど） */
    private String locale;
}

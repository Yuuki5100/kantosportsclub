// src/main/java/com/example/appserver/request/ReportJobRequest.java
package com.example.appserver.request.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportJobRequest {

    @NotNull(message = "reportIdは必須です")
    private Long reportId;

    // URLジョブ用のみ使用（ファイルダウンロードには不要）
    @NotBlank(message = "exportTargetは必須です")
    private String exportTarget;
}

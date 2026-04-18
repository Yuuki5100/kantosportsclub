package com.example.appserver.request.batchresult;

import lombok.Data;

/**
 * JobInstanceRequest サンプル用
 */
@Data
public class SampleJobInstanceRequest {

    private Long jobInstanceId;
    private Long version;
    private String jobName;
    private String jobKey;
    private String errorDisplayType;
}

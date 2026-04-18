package com.example.appserver.request.system;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SystemSettingUpdateRequest {

    private Integer passwordValidDays;
    private Integer passwordReissueUrlExpiration;
    private Integer numberOfRetries;
    private Integer numberOfNotices;
}

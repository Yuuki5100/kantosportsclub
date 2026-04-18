package com.example.appserver.response.system;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SystemSettingItem {
    private String settingName;
    private String settingID;
    private Object value;
}

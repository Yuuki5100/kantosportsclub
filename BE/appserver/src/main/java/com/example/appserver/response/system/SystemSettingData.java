package com.example.appserver.response.system;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SystemSettingData {
    private List<SystemSettingItem> systemSettings;
}

package com.example.appserver.response.manual;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ManualListItem {
    private Long manualId;
    private String manualTitle;
    private Boolean generalUser;
    private Boolean systemUser;
    private String updatedBy;
    private String updatedAt;
}

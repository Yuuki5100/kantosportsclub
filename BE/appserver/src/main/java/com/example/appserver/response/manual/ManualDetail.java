package com.example.appserver.response.manual;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ManualDetail {
    private Long manualId;
    private String manualTitle;
    private String description;
    private Boolean generalUser;
    private Boolean systemUser;
    private String updatedAt;
    private List<String> docIds;
    private Boolean deletedFlag;
}

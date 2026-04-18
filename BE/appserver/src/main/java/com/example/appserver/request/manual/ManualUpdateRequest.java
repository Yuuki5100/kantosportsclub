package com.example.appserver.request.manual;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class ManualUpdateRequest {
    @NotBlank
    @Size(max = 20)
    private String manualTitle;

    @Size(max = 250)
    private String description;

    private Boolean generalUser;
    private Boolean systemUser;

    private List<String> docIds;
}

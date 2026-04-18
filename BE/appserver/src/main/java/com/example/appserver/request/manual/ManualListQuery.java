package com.example.appserver.request.manual;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManualListQuery {
    @Size(max = 255)
    private String titleName;
    private Integer target;
    private Integer isdeleted;
    @Min(1)
    private Integer pageNumber;
    @Min(1)
    @Max(50)
    private Integer pagesize;
}

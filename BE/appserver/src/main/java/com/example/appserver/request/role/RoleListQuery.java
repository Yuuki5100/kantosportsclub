package com.example.appserver.request.role;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class RoleListQuery {
    @Min(1)
    private Integer pageNumber;
    @Min(1)
    @Max(50)
    private Integer pagesize;

    private Boolean isDeleted;
    private String name;
}

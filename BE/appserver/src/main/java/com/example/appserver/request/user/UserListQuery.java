package com.example.appserver.request.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UserListQuery {
    @Min(1)
    private Integer pageNumber;
    @Min(1)
    @Max(50)
    private Integer pagesize;

    private String name;
    private Integer roleId;
    private Boolean isLocked;
    private Boolean isDeleted;
}

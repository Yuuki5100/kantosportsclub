package com.example.appserver.response.role;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleDetailResponse {
    private Integer roleId;
    private String roleName;
    private Boolean isDeleted;
    private String deletionReason;
    private String description;
    private String creatorUserName;
    private String creatorUserId;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime createdAt;
    private String editorUserName;
    private String editorUserId;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime updatedAt;
    private List<RolePermissionModuleResponse> permissionDetails;
}

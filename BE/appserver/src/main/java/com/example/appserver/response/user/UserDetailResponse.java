package com.example.appserver.response.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDetailResponse {
    private String userId;
    private String email;
    private String surname;
    private String givenName;
    private String roleName;
    private Integer roleId;
    private Boolean isLocked;
    private Boolean isDeleted;
    private String mobileNo;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime passwordSetTime;
    private Integer failedLoginAttempts;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime lockOutTime;
    private String deletionReason;
    private String creatorUserId;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime createdAt;
    private String creatorUserName;
    private String editorUserId;
    private String editorUserName;
    @JsonFormat(pattern = "yyyy/MM/dd HH:mm:ss")
    private LocalDateTime updatedAt;
}

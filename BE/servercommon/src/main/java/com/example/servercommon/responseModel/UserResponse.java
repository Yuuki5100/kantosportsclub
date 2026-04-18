package com.example.servercommon.responseModel;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String userId;      // login識別子（users.user_id）
    private String givenName;
    private String surname;
    private String mobileNo;
    private String email;
    private Integer roleId;     // いまはID返しでOK
}

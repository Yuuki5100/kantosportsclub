package com.example.appserver.response.user;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserListData {
    private List<UserListResponse> users;
    private long total;
}

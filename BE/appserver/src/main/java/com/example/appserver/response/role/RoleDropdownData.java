package com.example.appserver.response.role;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoleDropdownData {
    private List<RoleDropdownResponse> roles;
}

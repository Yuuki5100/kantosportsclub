package com.example.servercommon.service;

import com.example.servercommon.model.UserModel;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<UserModel> getAllUsers();
    Optional<UserModel> getUserByUserId(String userId);

    UserModel createUser(UserModel user);
    UserModel updateUser(UserModel user);

    void deleteUser(String userId);

    UserModel createUserWithLoginInfo(UserModel user, String rawPassword);
}

package com.example.servercommon.mapper;

import com.example.servercommon.model.UserModel;
import com.example.servercommon.responseModel.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UserResponseMapper {
    UserResponseMapper INSTANCE = Mappers.getMapper(UserResponseMapper.class);

    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "roleId", source = "roleId")
    UserResponse fromUser(UserModel user);
}

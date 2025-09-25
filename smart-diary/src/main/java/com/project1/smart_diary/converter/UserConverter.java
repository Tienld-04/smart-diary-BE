package com.project1.smart_diary.converter;

import com.project1.smart_diary.dto.request.UserCreateRequest;
import com.project1.smart_diary.dto.response.UserResponse;
import com.project1.smart_diary.entity.UserEntity;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserConverter {
    @Autowired
    private ModelMapper modelMapper;

    public UserResponse convertToUserResponse(UserEntity user) {
        UserResponse userResponse = modelMapper.map(user, UserResponse.class);
        return userResponse;

    }
    public UserEntity convertToUserEntity(UserCreateRequest userCreateRequest) {
        UserEntity userEntity = modelMapper.map(userCreateRequest, UserEntity.class);
        return userEntity;
    }
}

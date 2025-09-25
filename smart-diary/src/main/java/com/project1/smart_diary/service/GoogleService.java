package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.UserConverter;
import com.project1.smart_diary.dto.LoginGoogleDTO;
import com.project1.smart_diary.dto.request.UserCreateRequest;
import com.project1.smart_diary.dto.response.UserResponse;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.enums.AuthProvider;
import com.project1.smart_diary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GoogleService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter userConverter;

    public UserResponse createUserWithGoogle(LoginGoogleDTO loginGoogleDTO) {
        if (userRepository.existsByEmail(loginGoogleDTO.getEmail())) {
            return null;
        } else {
            UserEntity userEntity = new UserEntity();
            userEntity.setEmail(loginGoogleDTO.getEmail());
            userEntity.setPassword(null);
            userEntity.setAvatarUrl(loginGoogleDTO.getAvatarUrl());
            userEntity.setFullname(loginGoogleDTO.getFullName());
            userEntity.setCreatedAt(loginGoogleDTO.getCreatedAt());
            userEntity.setProviderId(loginGoogleDTO.getProviderId());
            userEntity.setProvider(AuthProvider.GOOGLE);
            userRepository.save(userEntity);
            return userConverter.convertToUserResponse(userEntity);
        }
    }
}

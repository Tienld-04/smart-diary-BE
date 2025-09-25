package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.UserConverter;
import com.project1.smart_diary.dto.request.UserCreateRequest;
import com.project1.smart_diary.dto.response.UserResponse;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.enums.AuthProvider;
import com.project1.smart_diary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter userConverter;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreateRequest userCreateRequest) {
        if(userRepository.existsByEmail(userCreateRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        UserEntity userEntity = userConverter.convertToUserEntity(userCreateRequest);

//        UserEntity userEntity = new UserEntity();
//        userEntity.setEmail(userCreateRequest.getEmail());
        userEntity.setPassword(passwordEncoder.encode(userCreateRequest.getPassword()));
        userEntity.setProvider(AuthProvider.LOCAL);
        return userConverter.convertToUserResponse(userRepository.save(userEntity));
    }
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email);
        if(user == null) {
            throw  new RuntimeException("User not found");
        }
        return userConverter.convertToUserResponse(user);
    }


}

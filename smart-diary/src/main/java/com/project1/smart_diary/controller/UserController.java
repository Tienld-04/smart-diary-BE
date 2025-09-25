package com.project1.smart_diary.controller;

import com.project1.smart_diary.dto.response.UserResponse;
import com.project1.smart_diary.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService  userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/my-info")
    public ResponseEntity<UserResponse> getUser() {
        UserResponse userResponse = userService.getMyInfo();
        return ResponseEntity.ok(userResponse);
    }
}

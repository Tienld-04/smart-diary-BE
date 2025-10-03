package com.project1.smart_diary.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZEO_EXCEPTION(9999, "Unknown error.", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(1001, "User is not authenticated.", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1002, "User does not have access.", HttpStatus.FORBIDDEN),
    USER_EXISTED(1003, "User already exists.", HttpStatus.CONFLICT),
    USER_NOT_EXISTED(1004, "User does not exist in the system.", HttpStatus.NOT_FOUND),
    USERNAME_INVALID(1005, "Username invalid.", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1006, "Invalid password.", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_EXISTED(1007, "Email is incorrect.", HttpStatus.UNAUTHORIZED),
    PASSWORD_NOT_EXISTED(1008, "Password is incorrect.", HttpStatus.UNAUTHORIZED),
    TITLE_NOT_NULL(2001, "Title cannot be blank.", HttpStatus.BAD_REQUEST),
    CONTENT_NOT_NULL(2002, "Content cannot be blank.", HttpStatus.BAD_REQUEST),
    DATE_NULL(3001, "FromDate and ToDate cannot both be null.", HttpStatus.BAD_REQUEST),
    EMOTION_NULL(3002, "Emotions cannot be blank, please enter emotions to search.", HttpStatus.BAD_REQUEST),
    DIARY_NOT_FOUND(3003, "Diary not found", HttpStatus.NOT_FOUND),
    ;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.message = message;
        this.code = code;
        this.httpStatusCode = httpStatusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;

}
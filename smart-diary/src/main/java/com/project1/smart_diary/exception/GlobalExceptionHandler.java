package com.project1.smart_diary.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(ErrorCode.UNCATEGORIZEO_EXCEPTION.getCode())
                .message(ex.getMessage()) // không nên trả thẳng ex.getMessage() ra cho client nếu là production
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

//    @ExceptionHandler(value = BadCredentialsException.class)
//    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex){
//        ErrorResponse errorResponse = ErrorResponse.builder()
//                .code(ErrorCode.UNAUTHENTICATED.getCode())
//                .message(ErrorCode.UNAUTHENTICATED.getMessage())
//                .status(ErrorCode.UNAUTHENTICATED.getHttpStatusCode().value())
//                .build();
//
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
//    }
    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ErrorResponse> handleApplicationException(ApplicationException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .status(errorCode.getHttpStatusCode().value())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode().value())
                .body(errorResponse);
    }
}
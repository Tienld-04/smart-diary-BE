package com.project1.smart_diary.exception;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ApplicationException extends RuntimeException {
    public ApplicationException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    private ErrorCode errorCode;

}

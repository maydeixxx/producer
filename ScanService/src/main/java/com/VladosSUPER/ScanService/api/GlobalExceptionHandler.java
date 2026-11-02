package com.VladosSUPER.ScanService.api;

import com.VladosSUPER.ScanService.models.dtos.ErrorResponseDto;
import com.VladosSUPER.ScanService.models.exceptions.InstagramParsingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    @ExceptionHandler(InstagramParsingException.class)
    public ResponseEntity<ErrorResponseDto> handleInstagramParsingException(InstagramParsingException ex, WebRequest request) {
        log.error("Profile parsing error:", ex);
        ErrorResponseDto errorResponse = buildErrorResponse("Profile parsing error", ex.getMessage(), 400, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
        log.error("Illegal state error: ", ex);
        ErrorResponseDto errorResponse = buildErrorResponse("Illegal state error", ex.getMessage(), 409, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        log.error("Illegal argument error: ", ex);
        ErrorResponseDto errorResponse = buildErrorResponse("Illegal argument error", ex.getMessage(), 400, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleDefaultException(Exception ex, WebRequest request) {
        log.error("Internal server error: ", ex);
        ErrorResponseDto errorResponse = buildErrorResponse("Internal server error", ex.getMessage(), 500, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    private ErrorResponseDto buildErrorResponse(String error, String message, int code, WebRequest request) {
        return new ErrorResponseDto(
                error,
                message,
                code,
                request.getDescription(false).replace("uri=", ""),
                LocalDateTime.now().format(DATE_TIME_FORMATTER)
        );
    }
}

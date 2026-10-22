package com.VladosSUPER.TaskService.api;

import com.VladosSUPER.TaskService.models.dtos.ErrorResponseDTO;
import com.VladosSUPER.TaskService.models.exceptions.TaskNotFoundException;
import com.VladosSUPER.TaskService.models.exceptions.UpdateStrategyNotFound;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class TaskExceptionHandler {
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleTaskNotFoundException(TaskNotFoundException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = buildErrorResponse("Task not found", ex.getMessage(), 404, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(UpdateStrategyNotFound.class)
    public ResponseEntity<ErrorResponseDTO> handleUpdateStrategyNotFound(UpdateStrategyNotFound ex, WebRequest request) {
        ErrorResponseDTO errorResponse = buildErrorResponse("Strategy for update not found", ex.getMessage(), 404, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, WebRequest request) {
        String message = ex.getFieldErrors()
                .stream()
                .map(er -> er.getField() + ": " + er.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponseDTO errorResponse = buildErrorResponse("Argument not valid", message, 400, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = buildErrorResponse("Illegal argument", ex.getMessage(), 400, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
        ErrorResponseDTO errorResponse = buildErrorResponse("Illegal state", ex.getMessage(), 409, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleException(Exception ex, WebRequest request) {
        ErrorResponseDTO errorResponse = buildErrorResponse("Server error", ex.getMessage(), 500, request);
        return ResponseEntity.status(errorResponse.code()).body(errorResponse);
    }

    private ErrorResponseDTO buildErrorResponse(String error, String message, int code, WebRequest path) {
        return new ErrorResponseDTO(
                error,
                message,
                code,
                path.getDescription(false).replace("uri=", ""),
                LocalDateTime.now()
        );
    }
}

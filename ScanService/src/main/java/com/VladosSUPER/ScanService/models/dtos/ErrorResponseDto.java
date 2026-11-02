package com.VladosSUPER.ScanService.models.dtos;


public record ErrorResponseDto(
        String error,
        String message,
        int code,
        String path,
        String timestamp
) {
}

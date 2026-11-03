package com.VladosSUPER.ScanService.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ExpertUpdateDto(
        @NotNull(message = "Provide expert id")
        UUID id,
        @NotBlank(message = "Provide update strategy")
        String strategy,
        String newLink,
        String newNickname,
        Long newCoverage,
        String newTargetAudText,
        String need,
        String lever
) {
}

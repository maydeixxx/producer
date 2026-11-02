package com.VladosSUPER.ScanService.models.dtos;

import java.util.List;
import java.util.UUID;

public record ExpertDto(
        UUID id,
        String expertLink,
        String nickname,
        long coverage,
        List<String> needs,
        List<String> levers
) {
}

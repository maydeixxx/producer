package com.VladosSUPER.ScanService.models.dtos;

import java.util.List;

public record AiAnalysisResponse(
        String targetAud,
        List<String> needs,
        List<String> levers,
        long coverage
) {}
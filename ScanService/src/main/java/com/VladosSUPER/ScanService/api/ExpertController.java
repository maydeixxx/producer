package com.VladosSUPER.ScanService.api;

import com.VladosSUPER.ScanService.models.dtos.ExpertDto;
import com.VladosSUPER.ScanService.services.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/expert")
public class ExpertController {
    private final ExpertService expertService;

    @PostMapping()
    public ResponseEntity<ExpertDto> geetExpertInfo(@RequestParam String link) {
        ExpertDto expert = expertService.addNewExpert(link);
        return ResponseEntity.ok(expert);
    }
}

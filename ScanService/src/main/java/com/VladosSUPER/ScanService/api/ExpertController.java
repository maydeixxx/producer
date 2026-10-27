package com.VladosSUPER.ScanService.api;

import com.VladosSUPER.ScanService.services.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/expert")
public class ExpertController {
    private final ExpertService expertService;

    @GetMapping()
    public ResponseEntity<Void> geetExpertInfo(@RequestParam String link) {
        expertService.addNewExpert(link);
        return ResponseEntity.ok().build();
    }
}

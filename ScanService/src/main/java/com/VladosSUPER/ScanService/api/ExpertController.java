package com.VladosSUPER.ScanService.api;

import com.VladosSUPER.ScanService.models.dtos.ExpertDto;
import com.VladosSUPER.ScanService.models.dtos.ExpertUpdateDto;
import com.VladosSUPER.ScanService.services.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/all")
    public ResponseEntity<List<ExpertDto>> findAll() {
        List<ExpertDto> all = expertService.findAll();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/nickname")
    public ResponseEntity<ExpertDto> findByNickname(@RequestParam String nickname) {
        ExpertDto expertByNickname = expertService.findExpertByNickname(nickname);
        return ResponseEntity.ok(expertByNickname);
    }

    @GetMapping("/id")
    public ResponseEntity<ExpertDto> findById(@RequestParam UUID id) {
        ExpertDto expertById = expertService.findExpertById(id);
        return ResponseEntity.ok(expertById);
    }

    @PatchMapping("/update")
    public ResponseEntity<Void> updateExpert(@RequestBody ExpertUpdateDto dto) {
        expertService.updateExpert(dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteExpert(@RequestParam String nickname) {
        expertService.deleteExpert(nickname);
        return ResponseEntity.ok().build();
    }
}

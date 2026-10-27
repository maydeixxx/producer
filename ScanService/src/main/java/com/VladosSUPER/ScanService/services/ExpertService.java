package com.VladosSUPER.ScanService.services;

import com.VladosSUPER.ScanService.services.interfaces.ExpertRepository;
import com.VladosSUPER.ScanService.services.misc.ExpertMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExpertService {
    private final ExpertMapper expertMapper;
    private final ExpertRepository expertRepository;

    public void addNewExpert(String expertLink) {
        if (expertLink == null || expertLink.isBlank()) throw new IllegalArgumentException("Expert link cant be null or blank");
        //TODO логика обработки линки
    }
}

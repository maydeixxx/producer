package com.VladosSUPER.ScanService.services.misc;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.dtos.ExpertUpdateDto;
import com.VladosSUPER.ScanService.services.interfaces.ExpertUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class ExpertUpdateAddNewLeverStrategy implements ExpertUpdateStrategy {
    @Override
    public String getType() {
        return "addlever";
    }

    @Override
    public void update(ExpertUpdateDto dto, ExpertDomain domain) {
        domain.addNewLever(dto.lever());
    }
}

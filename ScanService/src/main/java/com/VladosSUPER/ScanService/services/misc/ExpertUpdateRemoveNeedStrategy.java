package com.VladosSUPER.ScanService.services.misc;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.dtos.ExpertUpdateDto;
import com.VladosSUPER.ScanService.services.interfaces.ExpertUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class ExpertUpdateRemoveNeedStrategy implements ExpertUpdateStrategy {
    @Override
    public String getType() {
        return "removeneed";
    }

    @Override
    public void update(ExpertUpdateDto dto, ExpertDomain domain) {
        domain.removeNeed(dto.need().toLowerCase());
    }
}

package com.VladosSUPER.ScanService.services.interfaces;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.dtos.ExpertUpdateDto;

public interface ExpertUpdateStrategy {
    String getType();
    void update(ExpertUpdateDto dto, ExpertDomain domain);
}

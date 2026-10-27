package com.VladosSUPER.ScanService.services.misc;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.entity.Expert;
import org.springframework.stereotype.Component;

@Component
public class ExpertMapper {
    public Expert domainToEntity(ExpertDomain domain) {
        Expert expert = new Expert();
        expert.setId(domain.getExpertId().id());
        expert.setExpertLink(domain.getExpertLink().link());
        expert.setExpertNickname(domain.getExpertNickname().rawNickname());
        expert.setCoverage(domain.getCoverage());
        expert.setTargetAud(domain.getTargetAud());
        expert.setLevers(domain.getLevers());
        expert.setNeeds(domain.getNeeds());

        return expert;
    }

    public ExpertDomain entityToDomain(Expert entity) {
        return ExpertDomain.restoreFromExisting(
                entity.getId(),
                entity.getExpertLink(),
                entity.getExpertNickname(),
                entity.getCoverage(),
                entity.getTargetAud(),
                entity.getNeeds(),
                entity.getLevers()
        );
    }
}

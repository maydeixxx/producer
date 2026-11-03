package com.VladosSUPER.ScanService.services.interfaces;

import com.VladosSUPER.ScanService.models.entity.Expert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpertRepository extends JpaRepository<Expert, UUID> {
    void deleteByExpertNickname(String expertNickname);

    Optional<Expert> findByExpertNickname(String expertNickname);
}

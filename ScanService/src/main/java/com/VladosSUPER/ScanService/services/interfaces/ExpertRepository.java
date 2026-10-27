package com.VladosSUPER.ScanService.services.interfaces;

import com.VladosSUPER.ScanService.models.entity.Expert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExpertRepository extends JpaRepository<Expert, UUID> {
}

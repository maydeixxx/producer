package com.VladosSUPER.ScanService.models.domain.valueObjects;

import com.github.f4b6a3.uuid.UuidCreator;

import java.util.Objects;
import java.util.UUID;

public record ExpertId(UUID id) {
    public ExpertId {
        Objects.requireNonNull(id, "Id cant be null");
    }

    public static ExpertId generateId() {
        return new ExpertId(UuidCreator.getTimeOrderedEpoch());
    }
}

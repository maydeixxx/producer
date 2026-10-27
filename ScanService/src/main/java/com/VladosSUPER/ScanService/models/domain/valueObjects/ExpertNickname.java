package com.VladosSUPER.ScanService.models.domain.valueObjects;

import java.util.Objects;

public record ExpertNickname(String rawNickname) {
    public ExpertNickname {
        Objects.requireNonNull(rawNickname, "Nickname cant be null");
    }

    public static ExpertNickname of(String rawNickname) {
        return new ExpertNickname(rawNickname.toLowerCase().trim());
    }
}

package com.VladosSUPER.ScanService.models.domain.valueObjects;

import java.util.Objects;

public record ExpertLink(String link) {
    public ExpertLink {
        Objects.requireNonNull(link, "Link cant be null");
        if (!link.startsWith("https://") || !link.contains("instagram.com")) throw new IllegalArgumentException("Link is incorrect");
    }

    public static ExpertLink of(String rawLink) {
        return new ExpertLink(rawLink.toLowerCase().trim());
    }
}

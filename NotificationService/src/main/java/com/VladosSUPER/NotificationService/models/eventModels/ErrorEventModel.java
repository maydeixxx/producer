package com.VladosSUPER.NotificationService.models.eventModels;

public record ErrorEventModel (
        String cause,
        Object payload
) {
}

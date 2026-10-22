package com.VladosSUPER.TaskService.models.domain.valueObjects;

import com.github.f4b6a3.uuid.UuidCreator;

import java.util.Objects;
import java.util.UUID;

public record TaskId(UUID id) {
    public TaskId {
        Objects.requireNonNull(id, "Task id cant be null");
    }

    public static TaskId generateTaskId() {
        return new TaskId(UuidCreator.getTimeOrderedEpoch());
    }
}

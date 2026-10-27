package com.VladosSUPER.TaskService.models.eventModels;

import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskStatus;
import com.VladosSUPER.TaskService.models.enums.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskEventModel(
        UUID id,
        String title,
        String description,
        TaskPriority taskPriority,
        TaskStatus taskStatus,
        TaskType taskType,
        LocalDate deadline,
        LocalDateTime createdAt,
        LocalDateTime lastActivityAt
) {
}

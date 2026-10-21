package com.VladosSUPER.TaskService.models.dtos;

import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskStatus;
import com.VladosSUPER.TaskService.models.enums.TaskType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskDTO(
        UUID id,
        String title,
        String description,
        LocalDate deadline,
        TaskStatus taskStatus,
        TaskType taskType,
        TaskPriority taskPriority,
        LocalDateTime createdAt,
        LocalDateTime lastActivityAt
) {
}

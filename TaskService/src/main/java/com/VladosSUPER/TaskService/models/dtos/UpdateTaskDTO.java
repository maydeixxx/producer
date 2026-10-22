package com.VladosSUPER.TaskService.models.dtos;

import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskDTO(
        @NotNull(message = "Provide task id")
        UUID taskId,
        @NotBlank(message = "Type of update is required")
        String type,
        TaskStatus newStatus,
        TaskPriority newPriority,
        String newTitle,
        String newDescription,
        LocalDate newDeadline
) {
}

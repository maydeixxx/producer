package com.VladosSUPER.TaskService.models.dtos;

import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateTaskDTO(
        @NotBlank(message = "Title is required")
        String title,
        @NotBlank(message = "Description is required")
        String description,
        @NotNull(message = "Task type is required")
        TaskType taskType,
        @NotNull(message = "Task priority is required")
        TaskPriority taskPriority,
        @NotNull(message = "Deadline is required")
        LocalDate deadline
) {
}

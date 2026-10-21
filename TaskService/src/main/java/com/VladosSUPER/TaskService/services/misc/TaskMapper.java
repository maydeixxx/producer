package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.TaskDTO;
import com.VladosSUPER.TaskService.models.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {
    public Task domainToEntity(TaskDomain domain) {
        Task task = new Task();
        task.setId(domain.getId().id());
        task.setTitle(domain.getTitle());
        task.setDescription(domain.getDescription());
        task.setTaskType(domain.getTaskType());
        task.setTaskStatus(domain.getTaskStatus());
        task.setTaskPriority(domain.getTaskPriority());
        task.setCreatedAt(domain.getCreatedAt());
        task.setDeadline(domain.getDeadline());
        task.setLastActivityAt(domain.getLastActivityAt());

        return task;
    }

    public TaskDTO entityToDto(Task entity) {
        return new TaskDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDeadline(),
                entity.getTaskStatus(),
                entity.getTaskType(),
                entity.getTaskPriority(),
                entity.getCreatedAt(),
                entity.getLastActivityAt()
        );
    }

    public TaskDomain entityToDomain(Task entity) {
        return TaskDomain.restoreFromExisting(
                entity.getId(),
                entity.getTaskType(),
                entity.getTaskStatus(),
                entity.getTaskPriority(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDeadline(),
                entity.getCreatedAt(),
                entity.getLastActivityAt()
        );
    }
}

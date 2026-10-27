package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.models.entity.OutboxEvent;
import com.VladosSUPER.TaskService.models.enums.OutboxStatus;
import com.VladosSUPER.TaskService.models.exceptions.OutboxEventNotFoundException;
import com.VladosSUPER.TaskService.services.interfaces.OutboxRepository;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TaskStatusUpdateStrategy implements TaskUpdateStrategy {
    private final OutboxRepository outboxRepository;

    @Override
    public String getType() {
        return "status";
    }

    @Override
    public void update(UpdateTaskDTO dto, TaskDomain domain) {
        switch (dto.newStatus()) {
            case PROCESSING -> domain.processTask();
            case DONE ->  {
                domain.completeTask();
                OutboxEvent event = outboxRepository.findByTaskId(dto.taskId()).orElseThrow(() -> new OutboxEventNotFoundException("Outbox for task [%s] not found".formatted(dto.taskId())));
                event.setStatus(OutboxStatus.PROCESSED);
                outboxRepository.save(event);
            }
            case TODO -> domain.setStatusTodo();
            default -> throw new IllegalArgumentException("Unknown new 'status'");
        }
    }
}

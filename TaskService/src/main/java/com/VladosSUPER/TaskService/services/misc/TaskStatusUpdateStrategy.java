package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class TaskStatusUpdateStrategy implements TaskUpdateStrategy {
    @Override
    public String getType() {
        return "status";
    }

    @Override
    public void update(UpdateTaskDTO dto, TaskDomain domain) {
        switch (dto.newStatus()) {
            case PROCESSING -> domain.processTask();
            case DONE -> domain.completeTask();
            case TODO -> domain.setStatusTodo();
            default -> throw new IllegalArgumentException("Unknown new 'status'");
        }
    }
}

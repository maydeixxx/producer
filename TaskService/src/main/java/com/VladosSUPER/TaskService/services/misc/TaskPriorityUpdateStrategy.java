package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class TaskPriorityUpdateStrategy implements TaskUpdateStrategy {
    @Override
    public String getType() {
        return "priority";
    }

    @Override
    public void update(UpdateTaskDTO dto, TaskDomain domain) {
        domain.updatePriority(dto.newPriority());
    }
}

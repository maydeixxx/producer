package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class TaskDeadlineUpdateStrategy implements TaskUpdateStrategy {
    @Override
    public String getType() {
        return "deadline";
    }

    @Override
    public void update(UpdateTaskDTO dto, TaskDomain domain) {
        domain.updateDeadline(dto.newDeadline());
    }
}

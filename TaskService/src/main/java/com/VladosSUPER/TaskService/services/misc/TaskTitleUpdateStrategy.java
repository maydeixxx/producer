package com.VladosSUPER.TaskService.services.misc;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import org.springframework.stereotype.Component;

@Component
public class TaskTitleUpdateStrategy implements TaskUpdateStrategy {
    @Override
    public String getType() {
        return "title";
    }

    @Override
    public void update(UpdateTaskDTO dto, TaskDomain domain) {
        domain.updateTitle(dto.newTitle());
    }
}

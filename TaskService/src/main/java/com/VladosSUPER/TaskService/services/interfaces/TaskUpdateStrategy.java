package com.VladosSUPER.TaskService.services.interfaces;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;

public interface TaskUpdateStrategy {
    String getType();
    void update(UpdateTaskDTO dto, TaskDomain domain);
}

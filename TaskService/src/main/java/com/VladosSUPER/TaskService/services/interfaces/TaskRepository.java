package com.VladosSUPER.TaskService.services.interfaces;

import com.VladosSUPER.TaskService.models.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByNormalizedTitleContaining(String query);
}

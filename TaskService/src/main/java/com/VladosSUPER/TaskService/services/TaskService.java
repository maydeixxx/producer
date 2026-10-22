package com.VladosSUPER.TaskService.services;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.CreateTaskDTO;
import com.VladosSUPER.TaskService.models.dtos.TaskDTO;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.models.entity.Task;
import com.VladosSUPER.TaskService.models.exceptions.TaskNotFoundException;
import com.VladosSUPER.TaskService.models.exceptions.UpdateStrategyNotFound;
import com.VladosSUPER.TaskService.services.interfaces.TaskRepository;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import com.VladosSUPER.TaskService.services.misc.TaskMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final Map<String, TaskUpdateStrategy> updateStrategyMap;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper, List<TaskUpdateStrategy> strategies) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.updateStrategyMap = new HashMap<>();

        for (TaskUpdateStrategy strategy : strategies) {
            updateStrategyMap.putIfAbsent(strategy.getType(), strategy);
        }
    }

    public void createTask(CreateTaskDTO dto) {
        TaskDomain newTask = TaskDomain.createTask(
                dto.taskType(),
                dto.taskPriority(),
                dto.title(),
                dto.description(),
                dto.deadline()
        );

        taskRepository.save(taskMapper.domainToEntity(newTask));
    }

    public List<TaskDTO> getTaskByTitle(String query) {
        if (query == null || query.isBlank()) throw new IllegalArgumentException("Query is required to find task(s)");

        return taskRepository.findByNormalizedTitleContaining(query.toLowerCase().trim()).stream()
                .map(taskMapper::entityToDto)
                .toList();
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(taskMapper::entityToDto)
                .toList();
    }

    public TaskDTO getTaskById(UUID id) {
        if (id == null) throw new IllegalArgumentException("Id is required to find the task");

        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task %s not found".formatted(id)));
        return taskMapper.entityToDto(task);
    }

    public void updateTask(UpdateTaskDTO dto) {
        Task task = taskRepository.findById(dto.taskId()).orElseThrow(() -> new TaskNotFoundException("Task %s not found".formatted(dto.taskId())));
        TaskDomain domain = taskMapper.entityToDomain(task);

        TaskUpdateStrategy strategy = updateStrategyMap.get(dto.type().toLowerCase().trim());
        if (strategy == null) throw new UpdateStrategyNotFound("Strategy [%s] not found".formatted(dto.type()));
        strategy.update(dto, domain);

        taskRepository.save(taskMapper.domainToEntity(domain));
    }

    public void deleteTaskById(UUID id) {
        if (id == null) throw new IllegalArgumentException("Id is required to delete the task");

        taskRepository.deleteById(id);
    }
}

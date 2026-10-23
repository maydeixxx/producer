package com.VladosSUPER.TaskService.services;

import com.VladosSUPER.TaskService.models.domain.TaskDomain;
import com.VladosSUPER.TaskService.models.dtos.CreateTaskDTO;
import com.VladosSUPER.TaskService.models.dtos.TaskDTO;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.models.entity.OutboxEvent;
import com.VladosSUPER.TaskService.models.entity.Task;
import com.VladosSUPER.TaskService.models.enums.OutboxStatus;
import com.VladosSUPER.TaskService.models.eventModels.TaskEventModel;
import com.VladosSUPER.TaskService.models.exceptions.TaskNotFoundException;
import com.VladosSUPER.TaskService.models.exceptions.UpdateStrategyNotFound;
import com.VladosSUPER.TaskService.services.interfaces.OutboxRepository;
import com.VladosSUPER.TaskService.services.interfaces.TaskRepository;
import com.VladosSUPER.TaskService.services.interfaces.TaskUpdateStrategy;
import com.VladosSUPER.TaskService.services.misc.TaskMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final Map<String, TaskUpdateStrategy> updateStrategyMap;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper, List<TaskUpdateStrategy> strategies, OutboxRepository outboxRepository, ObjectMapper objectMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.updateStrategyMap = new HashMap<>();
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;

        for (TaskUpdateStrategy strategy : strategies) {
            updateStrategyMap.putIfAbsent(strategy.getType(), strategy);
        }
    }

    /**
     * Method for creating new task
     *
     * @param dto - Model with params to create new Task
     */
    @Transactional
    public void createTask(CreateTaskDTO dto) {
        TaskDomain newTask = TaskDomain.createTask(
                dto.taskType(),
                dto.taskPriority(),
                dto.title(),
                dto.description(),
                dto.deadline()
        );

        TaskEventModel eventModel = new TaskEventModel(
                newTask.getId().id(),
                newTask.getTitle(),
                newTask.getDescription(),
                newTask.getTaskPriority(),
                newTask.getTaskStatus(),
                newTask.getTaskType(),
                newTask.getDeadline(),
                newTask.getCreatedAt(),
                newTask.getLastActivityAt()
        );

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .taskId(newTask.getId().id())
                .payload(objectMapper.writeValueAsString(eventModel))
                .createdAt(LocalDateTime.now())
                .status(OutboxStatus.NEW)
                .taskPriority(eventModel.taskPriority())
                .retries(0)
                .build();

        outboxRepository.save(outboxEvent);
        taskRepository.save(taskMapper.domainToEntity(newTask));
    }

    /**
     * Method for getting task by title
     *
     * @param query - title that user is using to search the task
     * @return - task if its found
     */
    public List<TaskDTO> getTaskByTitle(String query) {
        if (query == null || query.isBlank()) throw new IllegalArgumentException("Query is required to find task(s)");

        return taskRepository.findByNormalizedTitleContaining(query.toLowerCase().trim()).stream()
                .map(taskMapper::entityToDto)
                .toList();
    }

    /**
     * Method for getting all users tasks
     *
     * @return all users tasks
     */
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(taskMapper::entityToDto)
                .toList();
    }

    /**
     * Method for getting task by id
     *
     * @param id - taskId
     * @return found task if it exists
     */
    public TaskDTO getTaskById(UUID id) {
        if (id == null) throw new IllegalArgumentException("Id is required to find the task");

        Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException("Task %s not found".formatted(id)));
        return taskMapper.entityToDto(task);
    }

    /**
     * Method for updating task
     *
     * @param dto - Model with new fields and id to find the task and update it
     */
    @Transactional
    public void updateTask(UpdateTaskDTO dto) {
        Task task = taskRepository.findById(dto.taskId()).orElseThrow(() -> new TaskNotFoundException("Task %s not found".formatted(dto.taskId())));
        TaskDomain domain = taskMapper.entityToDomain(task);

        TaskUpdateStrategy strategy = updateStrategyMap.get(dto.type().toLowerCase().trim());
        if (strategy == null) throw new UpdateStrategyNotFound("Strategy [%s] not found".formatted(dto.type()));
        strategy.update(dto, domain);

        taskRepository.save(taskMapper.domainToEntity(domain));
    }

    /**
     * Method for deleting task
     *
     * @param id - id to find task and delete it
     */
    @Transactional
    public void deleteTaskById(UUID id) {
        if (id == null) throw new IllegalArgumentException("Id is required to delete the task");

        taskRepository.deleteById(id);
    }
}

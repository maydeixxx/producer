package com.VladosSUPER.TaskService.api;

import com.VladosSUPER.TaskService.models.dtos.CreateTaskDTO;
import com.VladosSUPER.TaskService.models.dtos.TaskDTO;
import com.VladosSUPER.TaskService.models.dtos.UpdateTaskDTO;
import com.VladosSUPER.TaskService.services.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping()
    public ResponseEntity<Void> createTask(@RequestBody @Valid CreateTaskDTO dto) {
        taskService.createTask(dto);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTaskById(id);
        return ResponseEntity.status(204).build();
    }

    @PatchMapping()
    public ResponseEntity<Void> updateTask(@RequestBody @Valid UpdateTaskDTO dto) {
        taskService.updateTask(dto);
        return ResponseEntity.status(204).build();
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable UUID id) {
        TaskDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @GetMapping()
    public ResponseEntity<List<TaskDTO>> getTasks() {
        List<TaskDTO> allTasks = taskService.getAllTasks();
        return ResponseEntity.ok(allTasks);
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<TaskDTO> getTaskByTitle(@PathVariable String title) {
        TaskDTO task = taskService.getTaskByTitle(title);
        return ResponseEntity.ok(task);
    }
}

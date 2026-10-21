package com.VladosSUPER.TaskService.models.domain;

import com.VladosSUPER.TaskService.models.domain.valueObjects.TaskId;
import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskStatus;
import com.VladosSUPER.TaskService.models.enums.TaskType;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Getter
public class TaskDomain {
    private final TaskId id;
    private final TaskType taskType;
    private TaskStatus taskStatus;
    private final TaskPriority taskPriority;
    private String title;
    private String description;

    private LocalDate deadline;
    private final LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;

    private TaskDomain(TaskId id, TaskType taskType, TaskStatus taskStatus, TaskPriority taskPriority, String title, String description, LocalDate deadline, LocalDateTime createdAt, LocalDateTime lastActivityAt) {
        if (taskType == null) throw new IllegalArgumentException("Provide task type");
        if (taskStatus == null) throw new IllegalArgumentException("Provide task status");
        if (taskPriority == null) throw new IllegalArgumentException("Provide task priority");

        if (title == null || title.isBlank()) throw new IllegalArgumentException("Provide task title");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("Provide task description");

        if (deadline == null) throw new IllegalArgumentException("Provide task deadline");
        if (createdAt == null) throw new IllegalArgumentException("Created at cant be null");
        if (lastActivityAt == null) throw new IllegalArgumentException("Last activity at cant be null");

        this.id = id;
        this.taskType = taskType;
        this.taskStatus = taskStatus;
        this.taskPriority = taskPriority;
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
    }

    public static TaskDomain createTask(TaskType taskType, TaskStatus taskStatus, TaskPriority taskPriority, String title, String description, LocalDate deadline) {
        TaskId taskId = TaskId.generateTaskId();
        LocalDateTime now = LocalDateTime.now();

        return new TaskDomain(taskId, taskType, taskStatus, taskPriority, title, description, deadline, now, now);
    }

    public static TaskDomain restoreFromExisting(UUID rawId, TaskType taskType, TaskStatus taskStatus, TaskPriority taskPriority, String title, String description, LocalDate deadline, LocalDateTime createdAt, LocalDateTime lastActivityAt) {
        TaskId taskId = new TaskId(rawId);
        return new TaskDomain(taskId, taskType, taskStatus, taskPriority, title, description, deadline, createdAt, lastActivityAt);
    }

    public void completeTask() {
        if (this.taskStatus.equals(TaskStatus.DONE)) throw new IllegalStateException("Task already completed");
        this.taskStatus = TaskStatus.DONE;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void setStatusTodo() {
        if (this.taskStatus.equals(TaskStatus.TODO)) throw new IllegalStateException("Task already have todo status");
        this.taskStatus = TaskStatus.TODO;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void processTask() {
        if (this.taskStatus.equals(TaskStatus.PROCESSING)) throw new IllegalStateException("Task already in processing");
        this.taskStatus = TaskStatus.PROCESSING;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void updateDeadline(LocalDate newDeadline) {
        if (newDeadline == null) throw new IllegalArgumentException("New deadline cant be null");
        this.deadline = newDeadline;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void updateDescription(String newDescription) {
        if (newDescription == null || newDescription.isBlank()) throw new IllegalArgumentException("New description is required");
        if (this.description.equals(newDescription)) throw new IllegalArgumentException("You cant set the same description");
        this.description = newDescription;
        this.lastActivityAt = LocalDateTime.now();
    }

    public void updateTitle(String newTitle) {
        if (newTitle == null || newTitle.isBlank()) throw new IllegalArgumentException("New title is required");
        if (this.title.equals(newTitle)) throw new IllegalArgumentException("You cant set the same title");
        this.title = newTitle;
        this.lastActivityAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof TaskDomain that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

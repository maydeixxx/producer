package com.VladosSUPER.TaskService.models.entity;

import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import com.VladosSUPER.TaskService.models.enums.TaskStatus;
import com.VladosSUPER.TaskService.models.enums.TaskType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "tasks", indexes = {
        @Index(name = "idx_normalized_title", columnList = "normalizedTitle")
})
public class Task {
    @Id
    private UUID id;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private TaskType taskType;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private TaskStatus taskStatus;

    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private TaskPriority taskPriority;


    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String normalizedTitle;
    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate deadline;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    private LocalDateTime lastActivityAt;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Task task)) return false;
        return Objects.equals(id, task.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

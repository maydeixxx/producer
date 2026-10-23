package com.VladosSUPER.TaskService.models.entity;

import com.VladosSUPER.TaskService.models.enums.OutboxStatus;
import com.VladosSUPER.TaskService.models.enums.TaskPriority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "outbox_events", indexes = @Index(name = "idx_status_createdAt", columnList = "outboxStatus, createdAt"))
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OutboxEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID taskId;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String payload;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    @Column(nullable = false)
    @Enumerated(value = EnumType.STRING)
    private OutboxStatus status;

    @Column(nullable = false)
    private TaskPriority taskPriority;

    @Column(nullable = false)
    private int retries;

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof OutboxEvent that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

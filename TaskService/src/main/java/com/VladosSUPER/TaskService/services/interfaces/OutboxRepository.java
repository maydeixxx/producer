package com.VladosSUPER.TaskService.services.interfaces;

import com.VladosSUPER.TaskService.models.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {
    @Query(value = """
            SELECT * FROM outbox_events e
            WHERE e.status = 'NEW'
            AND e.retries <= 3
            ORDER BY e.created_at ASC
            LIMIT 50
            FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    List<OutboxEvent> findOutboxEvents();

    Optional<OutboxEvent> findByTaskId(UUID taskId);
}

package com.VladosSUPER.TaskService.services;

import com.VladosSUPER.TaskService.models.entity.OutboxEvent;
import com.VladosSUPER.TaskService.models.enums.OutboxStatus;
import com.VladosSUPER.TaskService.models.eventModels.TaskEventModel;
import com.VladosSUPER.TaskService.services.interfaces.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OutboxEventPublisher {
    @Value("${kafka.topic.low-priority}")
    private String lowPrTopic;
    @Value("${kafka.topic.high-priority}")
    private String highPrTopic;
    @Value("${kafka.topic.mid-priority}")
    private String midPrTopic;

    private final KafkaTemplate<UUID, TaskEventModel> taskEventModelKafkaTemplate;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;
    private final OutboxRepository outboxRepository;


    @Scheduled()
    public void handleNewEvents() {
        try {
            List<OutboxEvent> outboxEvents = claimEvents();

            for (OutboxEvent event : outboxEvents) {
                try {
                    TaskEventModel eventModel = objectMapper.readValue(event.getPayload(), TaskEventModel.class);
                    switch (event.getTaskPriority()) {
                        case LOW -> taskEventModelKafkaTemplate.send(lowPrTopic, event.getTaskId(), eventModel);
                        case HIGH -> taskEventModelKafkaTemplate.send(highPrTopic, event.getTaskId(), eventModel);
                        case MEDIUM -> taskEventModelKafkaTemplate.send(midPrTopic, event.getTaskId(), eventModel);
                    }

                    log.info("New message sent. Task - {}", event.getTaskId());
                } catch (Exception e) {
                    log.error("Error sending new event: ", e);

                    if (event.getRetries() > 3) {
                        event.setStatus(OutboxStatus.FAILED);
                    } else {
                        event.setStatus(OutboxStatus.NEW);
                    }

                    event.setRetries(event.getRetries() + 1);
                    outboxRepository.save(event);
                }
            }
        } catch (Exception e) {
            log.error("Unexpected error: ", e);
        }
    }

    public List<OutboxEvent> claimEvents() {
        return transactionTemplate.execute(action -> {
            List<OutboxEvent> outboxEvents = outboxRepository.findOutboxEvents();
            for (OutboxEvent event : outboxEvents) {
                event.setStatus(OutboxStatus.PROCESSING);
                outboxRepository.save(event);
            }
            return outboxEvents;
        });
    }
}

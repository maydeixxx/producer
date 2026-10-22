package com.VladosSUPER.NotificationService.services;

import com.VladosSUPER.NotificationService.models.eventModels.TaskEventModel;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificationService {
//TODO

    @KafkaListener(
            topics = "${kafka.topic.high-priority}",
            groupId = "notification_service",
            containerFactory = "taskEventModelConcurrentKafkaListenerContainerFactory"
    )
    public void handleHighPriorityTask(ConsumerRecord<UUID, TaskEventModel> record) {
        if (record.key() == null) throw new IllegalArgumentException("Task id is null");
        if (record.value() == null) throw new IllegalArgumentException("Task model is null");


    }
}

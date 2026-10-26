package com.VladosSUPER.NotificationService.services;

import com.VladosSUPER.NotificationService.models.enums.TaskPriority;
import com.VladosSUPER.NotificationService.models.enums.TaskStatus;
import com.VladosSUPER.NotificationService.models.enums.TaskType;
import com.VladosSUPER.NotificationService.models.eventModels.TaskEventModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${telegram.base.url}")
    private String telegramBaseUrl;

    @Value("${telegram.bot.api-key}")
    private String telegramApiKey;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
    private static final String TASK_MESSAGE_TEMPLATE = """
            БХАТАН, У ТЕБЯ ЗАДАЧА ПРОСТАИВАЕТ УЖЕ С %s, ДАВАЙ ИСПРАВЛЯЙ
            
            📌 <b>%s</b>
            <code>ID: %s</code>
            📝 <b>Описание:</b>
            %s
            📊 <b>Статус:</b> %s
            ⚡ <b>Приоритет:</b> %s
            🏷 <b>Тип задачи:</b> %s
            📅 <b>Дедлайн:</b> %s
            🕒 <b>Создана:</b> %s
            """;
    public static String formatTask(
            UUID id,
            String title,
            String description,
            TaskPriority taskPriority,
            TaskStatus taskStatus,
            TaskType taskType,
            LocalDate deadline,
            LocalDateTime createdAt,
            LocalDateTime lastActivityAt
    ) {
        return TASK_MESSAGE_TEMPLATE.formatted(
                lastActivityAt.format(DATE_TIME_FORMATTER),
                title,
                id,
                description,
                taskStatus,
                taskPriority,
                taskType,
                deadline.format(DATE_FORMATTER),
                createdAt.format(DATE_TIME_FORMATTER)
        );
    }

    @KafkaListener(
            topics = "${kafka.topic.tasks-topic}",
            groupId = "notification_service",
            containerFactory = "taskEventModelConcurrentKafkaListenerContainerFactory"
    )
    public void handleHighPriorityTask(ConsumerRecord<UUID, TaskEventModel> record) {
        //TODO доделать правильную логику отправки сообщения в чат
        if (record.key() == null) throw new IllegalArgumentException("Task id is null");
        if (record.value() == null) throw new IllegalArgumentException("Task model is null");
        UUID id = record.key();
        TaskEventModel task = record.value();


        Map<String, String> requestBody = Map.of(
                "chat_id", "1108970251",
                "text", formatTask(id, task.title(), task.description(), task.taskPriority(), task.taskStatus(), task.taskType(), task.deadline(), task.createdAt(), task.lastActivityAt()),
                "parse_mode", "HTML"
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .header("Content-Type", "application/json")
                    .uri(new URI(telegramBaseUrl + telegramApiKey + "/sendMessage"))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) log.error("Error while sending request to bot, code: {}: {}", response.statusCode(), response.body());
        } catch (Exception e) {
            log.error("Cant process request to telegram bot: ", e);
        }
    }
}

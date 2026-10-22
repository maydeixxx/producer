package com.VladosSUPER.NotificationService.services.configs;

import com.VladosSUPER.NotificationService.models.eventModels.ErrorEventModel;
import com.VladosSUPER.NotificationService.models.eventModels.TaskEventModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.UUIDDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.ExponentialBackOffWithMaxRetries;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class NotificationListenerConfig {
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${kafka.topic.dlq}")
    private String dlqSuffix;

    private final KafkaTemplate<String, ErrorEventModel> template;

    @Bean
    public ConsumerFactory<UUID, TaskEventModel> taskEventModelConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, UUIDDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JacksonJsonDeserializer.class);
        props.put(JacksonJsonDeserializer.TRUSTED_PACKAGES, "*");

        return new DefaultKafkaConsumerFactory<>(
                props,
                new UUIDDeserializer(),
                new ErrorHandlingDeserializer<>(new JacksonJsonDeserializer<>(TaskEventModel.class, false))
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<UUID, TaskEventModel> taskEventModelConcurrentKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<UUID, TaskEventModel> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(taskEventModelConsumerFactory());
        factory.setCommonErrorHandler(defaultErrorHandler());

        return factory;
    }

    @Bean
    public DefaultErrorHandler defaultErrorHandler() {
        ExponentialBackOffWithMaxRetries exponentialBackOffWithMaxRetries = new ExponentialBackOffWithMaxRetries(3);
        exponentialBackOffWithMaxRetries.setInitialInterval(1000L);
        exponentialBackOffWithMaxRetries.setMaxInterval(4000);
        exponentialBackOffWithMaxRetries.setMultiplier(2);

        return new DefaultErrorHandler((consumerRecord, e) -> {
            log.error("Error handling message for topic {}: ", consumerRecord.topic(), e);
            ErrorEventModel errorModel = new ErrorEventModel(
                    e.getMessage(),
                    consumerRecord.value()
            );

            template.send(consumerRecord.topic() + dlqSuffix, e.getMessage(), errorModel);

            log.info("Sent new message in dlq topic {}: {}", consumerRecord.topic() + dlqSuffix, errorModel);
        }, exponentialBackOffWithMaxRetries);
    }
}

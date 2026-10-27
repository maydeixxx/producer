package com.VladosSUPER.ScanService.services.configs;

import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    public GoogleGenAiChatModel chatModel() {
        //TODO создать бин модели
    }

}

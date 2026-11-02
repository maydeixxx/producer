package com.VladosSUPER.ScanService.services;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.dtos.AiAnalysisResponse;
import com.VladosSUPER.ScanService.models.dtos.ExpertDto;
import com.VladosSUPER.ScanService.models.dtos.InstagramPost;
import com.VladosSUPER.ScanService.models.entity.Expert;
import com.VladosSUPER.ScanService.models.exceptions.InstagramParsingException;
import com.VladosSUPER.ScanService.services.interfaces.ExpertRepository;
import com.VladosSUPER.ScanService.services.misc.ExpertMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertService {
    private final ExpertMapper expertMapper;
    private final ExpertRepository expertRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.api-key}")
    private String apiKey;
    @Value("${ai.base-url}")
    private String aiBaseUrl;
    @Value("${scraper.base-url}")
    private String scraperBaseUrl;
    @Value("${scraper.token}")
    private String scraperToken;

    @Transactional
    public ExpertDto addNewExpert(String expertLink) {
        if (expertLink == null || expertLink.isBlank()) {
            throw new IllegalArgumentException("Expert link cant be null or blank");
        }
        String expertNickname = expertLink.split("/")[3];
        AiAnalysisResponse aiAnalysisResponse = scanProfile(expertLink);

        ExpertDomain newExpert = ExpertDomain.createExpert(
                expertLink,
                expertNickname,
                aiAnalysisResponse.coverage(),
                aiAnalysisResponse.targetAud(),
                aiAnalysisResponse.needs(),
                aiAnalysisResponse.levers()
        );

        Expert expert = expertMapper.domainToEntity(newExpert);
        expertRepository.save(expert);

        return expertMapper.entityToDto(expert);
    }

    private AiAnalysisResponse scanProfile(String link) {
        List<InstagramPost> instagramPosts = performRequest(link);

        if (instagramPosts == null || instagramPosts.isEmpty()) {
            throw new IllegalArgumentException("Получили пустой список постов");
        }
        long coverage = calculateCoverage(instagramPosts);

        String captions = instagramPosts.stream()
                .map(InstagramPost::caption)
                .limit(12)
                .collect(Collectors.joining(" ---- "));

        String prompt = """
                Ты маркетолог и продюсер. Проанализируй тексты постов эксперта в Instagram:
                ---
                Тексты постов через  ----  = %s
                ...
                ---
                
                На основе этих постов определи:
                1. targetAud: кто целевая аудитория блога (описание сегмента, статус, боли).
                2. needs: список из 5-10 ключевых болей/потребностей этой ЦА (почему они читают блог, что у них болит).
                3. levers: список из 5-10 рычагов/триггеров (обещания, триггеры свободы/дохода/признания, на которые они реагируют).
                
                Верни СТРОГО JSON и ничего больше, не пиши свои размышления, отдай ТОЛЬКО JSON:
                {
                  "targetAud": "Строка с описанием ЦА",
                  "needs": ["потребность 1", "потребность 2"],
                  "levers": ["рычаг 1", "рычаг 2"]
                }
                """.formatted(captions);
        String body = objectMapper.writeValueAsString(Map.of(
                "model", "nvidia/nemotron-3.5-super-vl:free",
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        ));

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(aiBaseUrl))
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode jsonNode = objectMapper.readTree(response.body());
            JsonNode content = null;

            if (jsonNode.has("choices")) {
                JsonNode choices = jsonNode.get("choices");
                if (choices.has(0)) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message")) {
                        JsonNode message = firstChoice.get("message");
                        if (message.has("content")) {
                            content = objectMapper.readTree(message.get("content").asString());
                        }
                    }
                }
            }

            if (content == null) throw new IllegalArgumentException("Cant get response from ai");
            List<String> needs = content.get("needs").asArray().valueStream()
                    .map(JsonNode::toString)
                    .toList();

            List<String> levers = content.get("levers").valueStream()
                    .map(JsonNode::toString)
                    .toList();
            return new AiAnalysisResponse(content.get("targetAud").asString(), needs, levers, coverage);
        } catch (Exception e) {
            log.error("Error processing request: ", e);
            throw new RuntimeException(e);
        }
    }

    private List<InstagramPost> performRequest(String link) {
        String nickname = link.split("/")[3];
        Map<String, Object> payload = Map.of(
                "directUrls", List.of(link),
                "resultsType", "reels",
                "resultsLimit", 12
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(scraperBaseUrl + scraperToken))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 201) throw new IllegalStateException("Status code is not 201");
            if (response.body() == null || response.body().isBlank()) throw new InstagramParsingException("Cant get info for %s".formatted(nickname));

            String body = response.body();
            ArrayNode arrayNode = objectMapper.readTree(body).asArray();
            JsonNode jsonNode = arrayNode.get(0);

            if (jsonNode.has("errorDescription")) {
                String errorDescription = jsonNode.get("errorDescription").asString();
                if (errorDescription != null && !errorDescription.isBlank()) {
                    if (errorDescription.contains("private")) throw new InstagramParsingException("%s profile is private".formatted(nickname));
                }
            }

            return objectMapper.readValue(body, new TypeReference<>() {
            });
        } catch (InstagramParsingException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private long calculateCoverage(List<InstagramPost> posts) {
        List<Long> views = posts.stream()
                .map(p -> p.videoPlayCount() != null ? p.videoPlayCount() : p.videoViewCount())
                .filter(Objects::nonNull)
                .filter(v -> v > 0)
                .toList();
        if (!views.isEmpty()) {
            return (long) views.stream().mapToLong(Long::longValue).average().orElseThrow(() -> new IllegalArgumentException("Error calculating views"));
        }
        long avgEngagement = (long) posts.stream()
                .mapToInt(p -> (p.likesCount() != null ? p.likesCount() : 0) +
                        (p.commentsCount() != null ? p.commentsCount() : 0))
                .average()
                .orElse(100.0);
        return Math.max(avgEngagement * 10, 500L);
    }
}

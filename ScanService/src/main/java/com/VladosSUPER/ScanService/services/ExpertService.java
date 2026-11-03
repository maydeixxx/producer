package com.VladosSUPER.ScanService.services;

import com.VladosSUPER.ScanService.models.domain.ExpertDomain;
import com.VladosSUPER.ScanService.models.dtos.AiAnalysisResponse;
import com.VladosSUPER.ScanService.models.dtos.ExpertDto;
import com.VladosSUPER.ScanService.models.dtos.ExpertUpdateDto;
import com.VladosSUPER.ScanService.models.dtos.InstagramPost;
import com.VladosSUPER.ScanService.models.entity.Expert;
import com.VladosSUPER.ScanService.models.exceptions.ExpertNotFoundException;
import com.VladosSUPER.ScanService.models.exceptions.InstagramParsingException;
import com.VladosSUPER.ScanService.models.exceptions.UpdateStrategyNotFound;
import com.VladosSUPER.ScanService.services.interfaces.ExpertRepository;
import com.VladosSUPER.ScanService.services.interfaces.ExpertUpdateStrategy;
import com.VladosSUPER.ScanService.services.misc.ExpertMapper;
import jakarta.transaction.Transactional;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ExpertService {
    private final ExpertMapper expertMapper;
    private final ExpertRepository expertRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Map<String, ExpertUpdateStrategy> updateStrategyMap;

    @Value("${ai.api-key}")
    private String apiKey;
    @Value("${ai.base-url}")
    private String aiBaseUrl;
    @Value("${scraper.base-url}")
    private String scraperBaseUrl;
    @Value("${scraper.token}")
    private String scraperToken;


    public ExpertService(ExpertMapper expertMapper, ExpertRepository expertRepository, HttpClient httpClient, ObjectMapper objectMapper, List<ExpertUpdateStrategy> updateStrategyList) {
        this.expertMapper = expertMapper;
        this.expertRepository = expertRepository;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.updateStrategyMap = new HashMap<>();

        for (ExpertUpdateStrategy strategy : updateStrategyList) {
            this.updateStrategyMap.putIfAbsent(strategy.getType(), strategy);
        }
    }

    @Transactional
    public ExpertDto addNewExpert(String expertLink) {
        if (expertLink == null || expertLink.isBlank()) {
            throw new IllegalArgumentException("Expert link cant be null or blank");
        }
        String expertNickname = expertLink.split("/")[3].toLowerCase();
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

    @Transactional
    public void deleteExpert(String nickname) {
        expertRepository.deleteByExpertNickname(nickname.toLowerCase().trim());
    }

    @Transactional
    public void updateExpert(ExpertUpdateDto dto) {
        Expert expert = expertRepository.findById(dto.id()).orElseThrow(() -> new ExpertNotFoundException("Expert %s not found".formatted(dto.id())));
        ExpertDomain expertDomain = expertMapper.entityToDomain(expert);

        ExpertUpdateStrategy strategy = updateStrategyMap.get(dto.strategy());
        if (strategy == null) throw new UpdateStrategyNotFound("Strategy %s not found".formatted(dto.strategy()));

        strategy.update(dto, expertDomain);
        expertRepository.save(expertMapper.domainToEntity(expertDomain));
    }

    public ExpertDto findExpertById(UUID id) {
        Expert expert = expertRepository.findById(id).orElseThrow(() -> new ExpertNotFoundException("Expert %s not found".formatted(id)));
        return expertMapper.entityToDto(expert);
    }

    public ExpertDto findExpertByNickname(String nickname) {
        Expert expert = expertRepository.findByExpertNickname(nickname.toLowerCase().trim()).orElseThrow(() -> new ExpertNotFoundException("Expert %s not found".formatted(nickname)));
        return expertMapper.entityToDto(expert);
    }

    public List<ExpertDto> findAll() {
        return expertRepository.findAll().stream()
                .map(expertMapper::entityToDto)
                .toList();
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
                Ты — топовый коммерческий инфобизнес-продюсер и ведущий эксперт по CustDev.
                Твоя задача — провести глубокий анализ аудитории эксперта по текстам его постов:
                ---
                Тексты постов:
                %s
                ---
                
                Проанализируй контент и сформируй выжимку СТРОГО по методологии реального кастдева:
                
                1. targetAud:
                   Опиши ключевой сегмент ЦА: их текущая жизненная ситуация, контекст (декрет, найм 5/2, быт, потолок дохода) и главная дилемма (например: «хотят больше денег, но боятся потерять семью/время»).
                
                2. needs (Боли и скрытые желания):
                   Выдели от 5 до 8 глубоких болей аудитории. 
                   ВАЖНОЕ ПРАВИЛО: Формулируй каждую боль через ЖИВУЮ РЕЧЬ аудитории (как будто они пишут в анкете или думают ночью).
                   Формат каждого пункта:
                   Суть боли — «Живая фраза в кавычках» (например: Зависимость и отсутствие своих денег — «Хочется не выпрашивать у мужа на каждую мелочь, а иметь свою подушку безопасности»).
                
                3. levers (Рычаги влияния и смысловые связки для контента):
                   Выдели от 5 до 8 конкретных рычагов. 
                   ВАЖНОЕ ПРАВИЛО: Рычаг — это не абстрактное слово («статус»), а КОНКРЕТНАЯ СМЫСЛОВАЯ СВЯЗКА ДЛЯ КОНТЕНТА: что эксперт должен показать/рассказать в блоге, чтобы закрыть конкретный страх аудитории.
                   Формат каждого пункта:
                   Страх/возражение -> Что показать в контенте (например: Возражение «У меня нет времени и ребенок не дает» -> Показать формат «День мамы-предпринимателя»: как работать всего 1–2 часа в день без ущерба семье).
                
                Ответь СТРОГО валидным JSON-объектом без лишних символов и без markdown-разметки:
                {
                  "targetAud": "Глубокое описание сегмента ЦА",
                  "needs": [
                    "Боль 1 — «Живая фраза аудитории»",
                    "Боль 2 — «Живая фраза аудитории»"
                  ],
                  "levers": [
                    "Страх/Боль -> Какую связку/историю показать в контенте",
                    "Возражение -> Какую связку/историю показать в контенте"
                  ]
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
                    .map(JsonNode::asString)
                    .toList();

            List<String> levers = content.get("levers").valueStream()
                    .map(JsonNode::asString)
                    .toList();

            content.get("targetAud").asString();
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
            if (response.body() == null || response.body().isBlank())
                throw new InstagramParsingException("Cant get info for %s".formatted(nickname));

            String body = response.body();
            ArrayNode arrayNode = objectMapper.readTree(body).asArray();
            JsonNode jsonNode = arrayNode.get(0);

            if (jsonNode.has("errorDescription")) {
                String errorDescription = jsonNode.get("errorDescription").asString();
                if (errorDescription != null && !errorDescription.isBlank()) {
                    if (errorDescription.contains("private"))
                        throw new InstagramParsingException("%s profile is private".formatted(nickname));
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

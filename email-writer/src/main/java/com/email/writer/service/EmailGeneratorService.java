package com.email.writer.service;

import com.email.writer.dto.EmailRequestDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
    @Value("${api.url}")
    private String apiURL;
    @Value("${api.key}")
    private String apiKey;
    public String generateEmailReply(EmailRequestDTO emailRequest) {
       String prompt=buildPrompt(emailRequest);

        Map<String, Object> requestBody=Map.of(
                "contents",new Object[]{
                        Map.of(
                                "parts",new Object[]{
                                        Map.of("text",prompt)
                                }
                        )
                }
        );
        System.out.println("Resolved API URL = " + apiURL);
        System.out.println("Resolved API KEY = " + apiKey);

        String response = webClient.post()
                .uri(apiURL+apiKey)
                .header("Content-Type","application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractEmailContent(response);
    }

    private String buildPrompt(EmailRequestDTO emailRequest)
    {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate an email for the following email content based on the tone of the email. Please don't generate subject line.\n\n");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("Usw a tone: ").append(emailRequest.getTone()).append("\n\n");
        }
        prompt.append("Email content: ").append(emailRequest.getEmailContent()).append("\n\n");
        return  prompt.toString();
    }

    private String extractEmailContent(String response)
    {
        try {
            ObjectMapper mapper=new ObjectMapper();
            JsonNode rootNode=mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }
        catch (Exception e){
            return "Error extracting email content: " + e.getMessage();
        }
    }
}

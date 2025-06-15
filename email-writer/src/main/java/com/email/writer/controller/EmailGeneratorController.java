package com.email.writer.controller;

import com.email.writer.dto.EmailRequestDTO;
import com.email.writer.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/email")
@AllArgsConstructor
@Slf4j
@CrossOrigin(
        origins = {"http://localhost:5173", "https://mail.google.com", "chrome-extension://*"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS},
        allowedHeaders = {"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"}
)
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequestDTO emailRequest){
        String emailResponse=emailGeneratorService.generateEmailReply(emailRequest);
        return ResponseEntity.ok(emailResponse);
    }
}

package com.email.writer.controller;

import com.email.writer.dto.EmailRequestDTO;
import com.email.writer.service.EmailGeneratorService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/email")
@AllArgsConstructor
@CrossOrigin(origins="http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequestDTO emailRequest){
        String emailResponse=emailGeneratorService.generateEmailReply(emailRequest);
        return ResponseEntity.ok(emailResponse);
    }
}

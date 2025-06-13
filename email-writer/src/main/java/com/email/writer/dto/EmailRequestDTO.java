package com.email.writer.dto;

import lombok.Data;

@Data
public class EmailRequestDTO {
    private String emailContent;
    private String tone;

}
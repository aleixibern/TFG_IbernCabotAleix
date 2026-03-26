package cat.tecnocampus.backend.dto;

import lombok.Data;

@Data
public class EpicRequest {
    private String title;
    private String description;
    private String color;
}
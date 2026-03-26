package cat.tecnocampus.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EpicResponse {
    private Long id;
    private String title;
    private String description;
    private String color;
    private Long projectId;
}
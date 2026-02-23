package cat.tecnocampus.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private String createdAt;
    private UserResponse owner;
    private String username;
    private String email;
    private List<String> members;
    private String subject;
}
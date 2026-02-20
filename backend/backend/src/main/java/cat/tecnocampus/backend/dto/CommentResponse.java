package cat.tecnocampus.backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String text;
    private String authorName;
    private String authorEmail;
    private String createdAt;
}
package cat.tecnocampus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitationResponse {
    private Long id;
    private String projectTitle;
    private String ownerName;
}
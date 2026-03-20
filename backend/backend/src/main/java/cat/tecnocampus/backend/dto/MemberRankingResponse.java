package cat.tecnocampus.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberRankingResponse {
    private String username;
    private String email;
    private Integer level;
    private Integer xp;
}
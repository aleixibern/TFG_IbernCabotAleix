package cat.tecnocampus.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SprintRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
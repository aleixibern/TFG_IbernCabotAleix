package cat.tecnocampus.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    private String title;
    private String description;

    private String type;
    private String priority;
    private LocalDate dueDate;
    private String assigneeEmail;
    private Long parentTaskId;
}
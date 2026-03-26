package cat.tecnocampus.backend.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String createdAt;
    private String type;
    private String priority;
    private LocalDate dueDate;
    private String assigneeName;
    private String assigneeEmail;
    private Long parentTaskId;
    private List<TaskResponse> subtasks;
    private Long sprintId;
    private List<String> links;
    private List<DependencyDto> dependencies;

    private EpicDto epic;

    @Data
    @AllArgsConstructor
    public static class DependencyDto {
        private Long id;
        private String title;
        private String status;
    }

    @Data
    @AllArgsConstructor
    public static class EpicDto {
        private Long id;
        private String title;
        private String color;
    }
}
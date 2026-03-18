package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.ActivityLog;
import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.ActivityLogResponse;
import cat.tecnocampus.backend.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void logAction(Project project, Task task, User user, String description, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .project(project)
                .task(task)
                .user(user)
                .actionDescription(description)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        activityLogRepository.save(log);
    }

    public List<ActivityLogResponse> getProjectActivity(Long projectId) {
        return activityLogRepository.findByProjectIdOrderByTimestampDesc(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        String taskTitle = log.getTask() != null ? log.getTask().getTitle() : null;
        String taskStatus = log.getTask() != null ? log.getTask().getStatus().name() : null;
        Long taskId = log.getTask() != null ? log.getTask().getId() : null;

        return ActivityLogResponse.builder()
                .id(log.getId())
                .userName(log.getUser().getUsername() != null ? log.getUser().getUsername() : log.getUser().getEmail())
                .userEmail(log.getUser().getEmail())
                .actionDescription(log.getActionDescription())
                .taskId(taskId)
                .taskTitle(taskTitle)
                .taskStatus(taskStatus)
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .timestamp(log.getTimestamp())
                .build();
    }
}
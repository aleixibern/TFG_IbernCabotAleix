package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskResponse createTask(Long projectId, TaskRequest request, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getEmail().equals(userEmail));
        if (!isOwner && !isMember) throw new RuntimeException("No autoritzat");

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .project(project)
                .type(request.getType() != null ? cat.tecnocampus.backend.domain.TaskType.valueOf(request.getType()) : cat.tecnocampus.backend.domain.TaskType.TASK)
                .priority(request.getPriority() != null ? cat.tecnocampus.backend.domain.TaskPriority.valueOf(request.getPriority()) : cat.tecnocampus.backend.domain.TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .build();

        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isEmpty()) {
            cat.tecnocampus.backend.domain.User assignee = userRepository.findByEmail(request.getAssigneeEmail())
                    .orElseThrow(() -> new RuntimeException("Usuari a assignar no trobat"));
            task.setAssignee(assignee);
        }

        if (request.getParentTaskId() != null) {
            Task parent = taskRepository.findById(request.getParentTaskId())
                    .orElseThrow(() -> new RuntimeException("Tasca pare no trobada"));
            task.setParentTask(parent);
        }

        return mapToResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasksByProject(Long projectId, String userEmail) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTaskStatus(Long taskId, String status, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        Project project = task.getProject();

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(userEmail));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per moure aquesta tasca");
        }

        task.setStatus(cat.tecnocampus.backend.domain.TaskStatus.valueOf(status));
        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    public void deleteTask(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        Project project = task.getProject();

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(userEmail));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per esborrar aquesta tasca");
        }

        taskRepository.delete(task);
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : "")
                .type(task.getType() != null ? task.getType().name() : null)
                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                .dueDate(task.getDueDate())
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getUsername() : null)
                .assigneeEmail(task.getAssignee() != null ? task.getAssignee().getEmail() : null)
                .parentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null)
                .subtasks(task.getSubtasks() != null ?
                        task.getSubtasks().stream().map(sub -> TaskResponse.builder()
                                .id(sub.getId())
                                .title(sub.getTitle())
                                .status(sub.getStatus().name())
                                .type(sub.getType() != null ? sub.getType().name() : null)
                                .assigneeName(sub.getAssignee() != null ? sub.getAssignee().getUsername() : null)
                                .build()
                        ).collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .build();
    }
    public TaskResponse updateTask(Long taskId, TaskRequest request, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        Project project = task.getProject();
        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getEmail().equals(userEmail));
        if (!isOwner && !isMember) throw new RuntimeException("No autoritzat");

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getType() != null) task.setType(cat.tecnocampus.backend.domain.TaskType.valueOf(request.getType()));
        if (request.getPriority() != null) task.setPriority(cat.tecnocampus.backend.domain.TaskPriority.valueOf(request.getPriority()));
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getAssigneeEmail() != null) {
            if (request.getAssigneeEmail().trim().isEmpty() || request.getAssigneeEmail().equals("UNASSIGNED")) {
                task.setAssignee(null);
            } else {
                User assignee = userRepository.findByEmail(request.getAssigneeEmail())
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                task.setAssignee(assignee);
            }
        }

        return mapToResponse(taskRepository.save(task));
    }
}
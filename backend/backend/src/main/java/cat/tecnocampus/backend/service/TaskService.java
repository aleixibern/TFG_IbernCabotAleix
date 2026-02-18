package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public TaskResponse createTask(Long projectId, TaskRequest request, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        // PERMETRE MEMBRES TAMBÉ:
        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(userEmail));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per crear tasques en aquest projecte");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.BACKLOG) // Totes les tasques noves van a l'esquerra de tot (BACKLOG)
                .project(project)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    public List<TaskResponse> getTasksByProject(Long projectId, String userEmail) {
        // Podríem comprovar l'owner aquí també per més seguretat
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
                .build();
    }
    public TaskResponse updateTask(Long taskId, String title, String description, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        Project project = task.getProject();

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(userEmail));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per editar aquesta tasca");
        }

        task.setTitle(title);
        task.setDescription(description);

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }
}
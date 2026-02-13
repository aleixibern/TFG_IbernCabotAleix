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

        if (!project.getOwner().getEmail().equals(userEmail)) {
            throw new RuntimeException("No autoritzat");
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

    public TaskResponse updateTaskStatus(Long taskId, String newStatus, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        if (!task.getProject().getOwner().getEmail().equals(userEmail)) {
            throw new RuntimeException("No autoritzat");
        }

        task.setStatus(TaskStatus.valueOf(newStatus.toUpperCase())); // Passem d'String a Enum
        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    public void deleteTask(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        if (!task.getProject().getOwner().getEmail().equals(userEmail)) {
            throw new RuntimeException("No autoritzat");
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
}
package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SprintRepository sprintRepository;

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

        if (request.getDependencyIds() != null && !request.getDependencyIds().isEmpty()) {
            List<Task> dependencies = taskRepository.findAllById(request.getDependencyIds());
            task.setDependencies(dependencies);
        }

        if (request.getSprintId() != null) {
            cat.tecnocampus.backend.domain.Sprint sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint no trobat"));
            task.setSprint(sprint);
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

        cat.tecnocampus.backend.domain.TaskStatus nouEstat = cat.tecnocampus.backend.domain.TaskStatus.valueOf(status);

        if (nouEstat == cat.tecnocampus.backend.domain.TaskStatus.IN_PROGRESS ||
                nouEstat == cat.tecnocampus.backend.domain.TaskStatus.IN_REVIEW ||
                nouEstat == cat.tecnocampus.backend.domain.TaskStatus.DONE) {

            boolean teDependenciesPendents = task.getDependencies().stream()
                    .anyMatch(dep -> dep.getStatus() != cat.tecnocampus.backend.domain.TaskStatus.DONE);

            if (teDependenciesPendents) {
                throw new RuntimeException("No pots moure la tasca: falten dependències per completar.");
            }
        }

        task.setStatus(nouEstat);
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

        for (Task dependentTask : task.getDependentTasks()) {
            dependentTask.getDependencies().remove(task);
            taskRepository.save(dependentTask);
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
                .links(task.getLinks())
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getUsername() : null)
                .assigneeEmail(task.getAssignee() != null ? task.getAssignee().getEmail() : null)
                .parentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null)
                .sprintId(task.getSprint() != null ? task.getSprint().getId() : null)

                .dependencies(task.getDependencies() != null ?
                        task.getDependencies().stream()
                                .map(dep -> new TaskResponse.DependencyDto(dep.getId(), dep.getTitle(), dep.getStatus().name()))
                                .collect(Collectors.toList())
                        : new ArrayList<>())

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
        if (request.getLinks() != null) task.setLinks(request.getLinks());
        if (request.getType() != null) task.setType(cat.tecnocampus.backend.domain.TaskType.valueOf(request.getType()));
        if (request.getPriority() != null) task.setPriority(cat.tecnocampus.backend.domain.TaskPriority.valueOf(request.getPriority()));
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getDependencyIds() != null) {
            List<Task> newDependencies = taskRepository.findAllById(request.getDependencyIds());
            task.setDependencies(newDependencies);
        }

        if (request.getAssigneeEmail() != null) {
            if (request.getAssigneeEmail().trim().isEmpty() || request.getAssigneeEmail().equals("UNASSIGNED")) {
                task.setAssignee(null);
            } else {
                User assignee = userRepository.findByEmail(request.getAssigneeEmail())
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                task.setAssignee(assignee);
            }
        }
        if (request.getSprintId() != null) {
            if (request.getSprintId() == -1) {
                task.setSprint(null);
            } else {
                cat.tecnocampus.backend.domain.Sprint sprint = sprintRepository.findById(request.getSprintId())
                        .orElseThrow(() -> new RuntimeException("Sprint no trobat"));
                task.setSprint(sprint);
            }
        }
        return mapToResponse(taskRepository.save(task));
    }
}
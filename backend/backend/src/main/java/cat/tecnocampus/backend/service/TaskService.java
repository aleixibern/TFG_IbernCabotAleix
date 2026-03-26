package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.domain.UserProjectStats;
import cat.tecnocampus.backend.domain.Epic;
import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import cat.tecnocampus.backend.repository.UserProjectStatsRepository;
import cat.tecnocampus.backend.repository.EpicRepository;
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
    private final ActivityLogService activityLogService;
    private final UserProjectStatsRepository userProjectStatsRepository;
    private final EpicRepository epicRepository; // NOU: Afegit el repositori d'èpiques

    // --- FUNCIÓ AUXILIAR: Calcular XP per prioritat ---
    private int calculateXp(Task task) {
        if (task.getPriority() == null) return 10;
        switch (task.getPriority()) {
            case LOW: return 10;
            case MEDIUM: return 20;
            case HIGH: return 30;
            case URGENT: return 50;
            default: return 10;
        }
    }

    // --- SUMAR XP ---
    private void awardExperiencePoints(Task task, User currentUser) {
        User userToReward = task.getAssignee() != null ? task.getAssignee() : currentUser;
        Project project = task.getProject();

        UserProjectStats stats = userProjectStatsRepository.findByUserEmailAndProjectId(userToReward.getEmail(), project.getId())
                .orElse(UserProjectStats.builder().user(userToReward).project(project).level(1).xp(0).build());

        int xpToAward = calculateXp(task);
        int newXp = stats.getXp() + xpToAward;
        int currentLevel = stats.getLevel();

        if (newXp >= 100) {
            currentLevel++;
            newXp = newXp - 100;
        }

        stats.setXp(newXp);
        stats.setLevel(currentLevel);
        userProjectStatsRepository.save(stats);
    }

    private void removeExperiencePoints(Task task, User currentUser) {
        User userToReward = task.getAssignee() != null ? task.getAssignee() : currentUser;
        Project project = task.getProject();

        UserProjectStats stats = userProjectStatsRepository.findByUserEmailAndProjectId(userToReward.getEmail(), project.getId())
                .orElse(UserProjectStats.builder().user(userToReward).project(project).level(1).xp(0).build());

        int xpToRemove = calculateXp(task);
        int newXp = stats.getXp() - xpToRemove;
        int currentLevel = stats.getLevel();

        if (newXp < 0 && currentLevel > 1) {
            currentLevel--;
            newXp = 100 + newXp;
        }

        if (currentLevel == 1 && newXp < 0) {
            newXp = 0;
        }

        stats.setXp(newXp);
        stats.setLevel(currentLevel);
        userProjectStatsRepository.save(stats);
    }

    public TaskResponse createTask(Long projectId, TaskRequest request, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

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

        // NOU: Guardar l'Èpica si ve a la petició
        if (request.getEpicId() != null) {
            Epic epic = epicRepository.findById(request.getEpicId())
                    .orElseThrow(() -> new RuntimeException("Èpica no trobada"));
            task.setEpic(epic);
        }

        Task savedTask = taskRepository.save(task);

        activityLogService.logAction(project, savedTask, currentUser, "ha creat la tasca", null, savedTask.getStatus().name());

        return mapToResponse(savedTask);
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
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(userEmail));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per moure aquesta tasca");
        }

        cat.tecnocampus.backend.domain.TaskStatus nouEstat = cat.tecnocampus.backend.domain.TaskStatus.valueOf(status);
        String oldStatusString = task.getStatus() != null ? task.getStatus().name() : "Desconegut";

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

        if (nouEstat == cat.tecnocampus.backend.domain.TaskStatus.DONE && !oldStatusString.equals("DONE")) {
            awardExperiencePoints(savedTask, currentUser);
        } else if (oldStatusString.equals("DONE") && nouEstat != cat.tecnocampus.backend.domain.TaskStatus.DONE) {
            removeExperiencePoints(savedTask, currentUser);
        }

        activityLogService.logAction(project, savedTask, currentUser, "ha actualitzat el camp 'Estat' en", oldStatusString, nouEstat.name());

        return mapToResponse(savedTask);
    }

    public void deleteTask(Long taskId, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        Project project = task.getProject();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

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

        String taskTitle = task.getTitle();


        taskRepository.delete(task);

        activityLogService.logAction(project, null, currentUser, "ha eliminat la tasca '" + taskTitle + "'", null, null);
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

                // NOU: Assignar l'epic si la tasca en té una
                .epic(task.getEpic() != null ? new TaskResponse.EpicDto(task.getEpic().getId(), task.getEpic().getTitle(), task.getEpic().getColor()) : null)

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
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getEmail().equals(userEmail));
        if (!isOwner && !isMember) throw new RuntimeException("No autoritzat");

        boolean fieldsChanged = false;

        if (request.getTitle() != null && !request.getTitle().equals(task.getTitle())) {
            task.setTitle(request.getTitle());
            fieldsChanged = true;
        }
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

        // NOU: Actualitzar l'Èpica si ve a la petició
        if (request.getEpicId() != null) {
            if (request.getEpicId() == -1) {
                task.setEpic(null); // Esborrar l'èpica
            } else {
                Epic epic = epicRepository.findById(request.getEpicId())
                        .orElseThrow(() -> new RuntimeException("Èpica no trobada"));
                task.setEpic(epic);
            }
        }

        Task savedTask = taskRepository.save(task);

        activityLogService.logAction(project, savedTask, currentUser, "ha editat detalls de", null, null);

        return mapToResponse(savedTask);
    }
}
package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Sprint;
import cat.tecnocampus.backend.domain.SprintStatus;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.dto.SprintRequest;
import cat.tecnocampus.backend.dto.SprintResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public SprintResponse createSprint(Long projectId, SprintRequest request, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getEmail().equals(userEmail));
        if (!isOwner && !isMember) throw new RuntimeException("No autoritzat per crear Sprints");

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = request.getEndDate();

        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("La data d'inici no pot ser posterior a la data final.");
        }

        boolean existsOverlap = sprintRepository.existsOverlappingSprint(projectId, startDate, endDate);
        if (existsOverlap) {
            throw new RuntimeException("Ja existeix un Sprint actiu o planificat per a aquest projecte que se solapa amb les dates seleccionades.");
        }

        Sprint sprint = Sprint.builder()
                .name(request.getName())
                .startDate(startDate)
                .endDate(endDate)
                .project(project)
                .status(SprintStatus.PLANNED)
                .build();

        Sprint savedSprint = sprintRepository.save(sprint);
        return mapToResponse(savedSprint);
    }

    public List<SprintResponse> getSprintsByProject(Long projectId, String userEmail) {
        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SprintResponse startSprint(Long projectId, Long sprintId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(userEmail);
        boolean isMember = project.getMembers().stream().anyMatch(m -> m.getEmail().equals(userEmail));
        if (!isOwner && !isMember) throw new RuntimeException("No autoritzat per gestionar Sprints");

        Optional<Sprint> currentActive = sprintRepository.findFirstByProjectIdAndStatus(projectId, SprintStatus.ACTIVE);
        if (currentActive.isPresent()) {
            throw new RuntimeException("No pots iniciar aquest Sprint perquè ja n'hi ha un d'actiu. Has de completar l'actual primer.");
        }

        Sprint sprintToStart = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint no trobat"));

        if (!sprintToStart.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Aquest Sprint no pertany a aquest projecte.");
        }

        sprintToStart.setStatus(SprintStatus.ACTIVE);
        sprintToStart.setStartDate(java.time.LocalDate.now());

        return mapToResponse(sprintRepository.save(sprintToStart));
    }

    public SprintResponse getActiveSprint(Long projectId, String userEmail) {
        return sprintRepository.findFirstByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public SprintResponse completeSprint(Long projectId, Long sprintId, String userEmail) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow(() -> new RuntimeException("Sprint no trobat"));

        // Llista de tasques de l'sprint actual
        List<cat.tecnocampus.backend.domain.Task> sprintTasks = taskRepository.findBySprintId(sprintId);

        int completedCount = 0;
        int pendingCount = 0;
        Map<String, Integer> assigneeCounts = new HashMap<>();

        for (cat.tecnocampus.backend.domain.Task task : sprintTasks) {
            if (task.getStatus() == TaskStatus.DONE) {
                completedCount++;
                String assigneeName = task.getAssignee() != null ? task.getAssignee().getUsername() : "Equip";
                assigneeCounts.put(assigneeName, assigneeCounts.getOrDefault(assigneeName, 0) + 1);
            } else {
                pendingCount++;
                // LÒGICA NOVA: Si no està DONE, desvinculem la tasca de l'Sprint i torna al BACKLOG
                task.setSprint(null);
                task.setStatus(TaskStatus.BACKLOG);
                taskRepository.save(task);
            }
        }

        String mvpName = "L'equip sencer";
        int maxTasks = 0;
        for (Map.Entry<String, Integer> entry : assigneeCounts.entrySet()) {
            if (entry.getValue() > maxTasks && !entry.getKey().equals("Equip")) {
                maxTasks = entry.getValue();
                mvpName = entry.getKey();
            }
        }

        // Guardem el resum a l'Sprint i el tanquem
        sprint.setStatus(SprintStatus.CLOSED);
        sprint.setCompletedTasksCount(completedCount);
        sprint.setPendingTasksCount(pendingCount);
        sprint.setMvpUserName(mvpName);

        return mapToResponse(sprintRepository.save(sprint));
    }

    public void deleteSprint(Long projectId, Long sprintId, String userEmail) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint no trobat"));

        List<cat.tecnocampus.backend.domain.Task> tasks = taskRepository.findBySprintId(sprintId);

        for (cat.tecnocampus.backend.domain.Task task : tasks) {
            task.setSprint(null);
            taskRepository.save(task);
        }

        sprintRepository.delete(sprint);
    }

    private SprintResponse mapToResponse(Sprint sprint) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .projectId(sprint.getProject().getId())
                .status(sprint.getStatus() != null ? sprint.getStatus().name() : "PLANNED")
                .completedTasks(sprint.getCompletedTasksCount())
                .pendingTasks(sprint.getPendingTasksCount())
                .mvpUserName(sprint.getMvpUserName())
                .build();
    }
}
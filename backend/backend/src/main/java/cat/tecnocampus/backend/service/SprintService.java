package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Sprint;
import cat.tecnocampus.backend.dto.SprintRequest;
import cat.tecnocampus.backend.dto.SprintResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

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
                .build();

        Sprint savedSprint = sprintRepository.save(sprint);
        return mapToResponse(savedSprint);
    }

    public List<SprintResponse> getSprintsByProject(Long projectId, String userEmail) {
        return sprintRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SprintResponse mapToResponse(Sprint sprint) {
        return SprintResponse.builder()
                .id(sprint.getId())
                .name(sprint.getName())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .projectId(sprint.getProject().getId())
                .build();
    }
}
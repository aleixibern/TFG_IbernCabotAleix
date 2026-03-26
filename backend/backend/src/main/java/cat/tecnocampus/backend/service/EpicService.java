package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Epic;
import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.dto.EpicRequest;
import cat.tecnocampus.backend.dto.EpicResponse;
import cat.tecnocampus.backend.repository.EpicRepository;
import cat.tecnocampus.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EpicService {

    private final EpicRepository epicRepository;
    private final ProjectRepository projectRepository;

    public EpicResponse createEpic(Long projectId, EpicRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        Epic epic = Epic.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#F5A524")
                .project(project)
                .build();

        Epic savedEpic = epicRepository.save(epic);
        return mapToResponse(savedEpic);
    }

    public List<EpicResponse> getEpicsByProject(Long projectId) {
        return epicRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EpicResponse mapToResponse(Epic epic) {
        return EpicResponse.builder()
                .id(epic.getId())
                .title(epic.getTitle())
                .description(epic.getDescription())
                .color(epic.getColor())
                .projectId(epic.getProject().getId())
                .build();
    }
}
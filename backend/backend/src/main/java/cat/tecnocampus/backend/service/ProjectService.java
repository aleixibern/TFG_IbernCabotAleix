package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.ProjectRequest;
import cat.tecnocampus.backend.dto.ProjectResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectResponse createProject(ProjectRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .owner(owner)
                .build();

        Project savedProject = projectRepository.save(project);

        return mapToResponse(savedProject);
    }

    public List<ProjectResponse> getUserProjects(String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        List<Project> projects = projectRepository.findAllByOwnerId(owner.getId());

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .build();
    }

    public void deleteProject(Long projectId, String currentUserEmail) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        if (!project.getOwner().getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("No tens permís per eliminar aquest projecte");
        }

        projectRepository.delete(project);
    }
}

package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.ProjectRequest;
import cat.tecnocampus.backend.dto.ProjectResponse;
import cat.tecnocampus.backend.dto.UserResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
                .createdAt(LocalDateTime.now())
                .build();

        Project savedProject = projectRepository.save(project);
        return mapToResponse(savedProject);
    }

    public List<ProjectResponse> getUserProjects(String userEmail) {
        return projectRepository.findByOwnerEmail(userEmail)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));
    }

    public void deleteProject(Long id, String username) {
        Project project = findById(id);
        if (!project.getOwner().getEmail().equals(username)) {
            throw new RuntimeException("No autoritzat");
        }
        projectRepository.delete(project);
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : "")
                .owner(UserResponse.builder()
                        .email(project.getOwner().getEmail())
                        .username(project.getOwner().getUsername()) // Ara això no petarà
                        .build())
                .build();
    }
    public ProjectResponse getProjectById(Long id, String userEmail) {
        Project project = findById(id);
        if (!project.getOwner().getEmail().equals(userEmail)) {
            throw new RuntimeException("No autoritzat per veure aquest projecte");
        }
        return mapToResponse(project);
    }
}
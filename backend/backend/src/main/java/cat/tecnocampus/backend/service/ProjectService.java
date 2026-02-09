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

    // Mètode per CREAR un projecte
    public ProjectResponse createProject(ProjectRequest request, String userEmail) {
        // 1. Busquem l'usuari propietari
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        // 2. Creem el projecte
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .owner(owner) // <--- Aquí fem la relació!
                .build();

        // 3. Guardem a BBDD
        Project savedProject = projectRepository.save(project);

        // 4. Convertim a DTO per tornar-ho
        return mapToResponse(savedProject);
    }

    // Mètode per LLISTAR els projectes d'un usuari
    public List<ProjectResponse> getUserProjects(String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        // Fem servir el mètode màgic del repositori que vam crear l'altre dia
        List<Project> projects = projectRepository.findAllByOwnerId(owner.getId());

        // Convertim la llista d'Entitats a llista de DTOs
        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Utilitat per convertir (Mapper)
    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
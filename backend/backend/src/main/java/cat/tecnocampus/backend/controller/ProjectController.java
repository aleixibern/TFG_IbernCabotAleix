package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.ProjectRequest;
import cat.tecnocampus.backend.dto.ProjectResponse;
import cat.tecnocampus.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest request) {
        // Obtenim l'email de l'usuari autenticat (del Token JWT)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return ResponseEntity.ok(projectService.createProject(request, email));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return ResponseEntity.ok(projectService.getUserProjects(email));
    }
}
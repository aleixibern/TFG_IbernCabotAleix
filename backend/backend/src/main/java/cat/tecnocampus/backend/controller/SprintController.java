package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.SprintRequest;
import cat.tecnocampus.backend.dto.SprintResponse;
import cat.tecnocampus.backend.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    public ResponseEntity<SprintResponse> createSprint(
            @PathVariable Long projectId,
            @RequestBody SprintRequest request,
            Principal principal) {
        return ResponseEntity.ok(sprintService.createSprint(projectId, request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<SprintResponse>> getProjectSprints(
            @PathVariable Long projectId,
            Principal principal) {
        return ResponseEntity.ok(sprintService.getSprintsByProject(projectId, principal.getName()));
    }

    @PutMapping("/{sprintId}/start")
    public ResponseEntity<SprintResponse> startSprint(
            @PathVariable Long projectId,
            @PathVariable Long sprintId,
            Principal principal) {
        return ResponseEntity.ok(sprintService.startSprint(projectId, sprintId, principal.getName()));
    }

    @GetMapping("/active")
    public ResponseEntity<SprintResponse> getActiveSprint(
            @PathVariable Long projectId,
            Principal principal) {
        SprintResponse activeSprint = sprintService.getActiveSprint(projectId, principal.getName());
        if (activeSprint == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activeSprint);
    }

    @PutMapping("/{sprintId}/complete")
    public ResponseEntity<SprintResponse> completeSprint(@PathVariable Long projectId, @PathVariable Long sprintId, java.security.Principal principal) {
        return ResponseEntity.ok(sprintService.completeSprint(projectId, sprintId, principal.getName()));
    }
}
package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.*;
import cat.tecnocampus.backend.service.ActivityLogService;
import cat.tecnocampus.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ActivityLogService activityLogService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return ResponseEntity.ok(projectService.createProject(request, email));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return ResponseEntity.ok(projectService.getProjectsByUser(email));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, Principal principal) {
        try {
            projectService.deleteProject(id, principal.getName());

            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id, Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(projectService.getProjectById(id, email));
    }
    @PostMapping("/{id}/invite")
    public ResponseEntity<Void> inviteMember(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        projectService.sendInvitation(id, body.get("email"), principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<InvitationResponse>> getInvitations(Principal principal) {
        return ResponseEntity.ok(projectService.getUserInvitations(principal.getName()));
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable Long invitationId, Principal principal) {
        projectService.acceptInvitation(invitationId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/invitations/{invitationId}")
    public ResponseEntity<Void> declineInvitation(@PathVariable Long invitationId, Principal principal) {
        projectService.declineInvitation(invitationId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<List<ActivityLogResponse>> getProjectActivity(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(activityLogService.getProjectActivity(id));
    }

    @GetMapping("/{id}/ranking")
    public ResponseEntity<List<MemberRankingResponse>> getProjectRanking(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectRanking(id));
    }
}
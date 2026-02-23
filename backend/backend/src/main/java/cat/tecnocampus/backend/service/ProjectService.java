package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.ProjectInvitation;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.InvitationResponse;
import cat.tecnocampus.backend.dto.ProjectRequest;
import cat.tecnocampus.backend.dto.ProjectResponse;
import cat.tecnocampus.backend.dto.UserResponse;
import cat.tecnocampus.backend.repository.ProjectInvitationRepository;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
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
    private final ProjectInvitationRepository invitationRepository;

    public ProjectResponse createProject(ProjectRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .owner(owner)
                .createdAt(LocalDateTime.now())
                .build();

        Project savedProject = projectRepository.save(project);
        return mapToResponse(savedProject);
    }

    public List<ProjectResponse> getProjectsByUser(String email) {
        return projectRepository.findAllProjectsForUser(email).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
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
                .subject(project.getSubject())
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : "")
                .username(project.getOwner() != null ? project.getOwner().getUsername() : "Sense nom")
                .email(project.getOwner() != null ? project.getOwner().getEmail() : "")
                .members(project.getMembers() != null ?
                        project.getMembers().stream().map(user -> user.getEmail()).collect(java.util.stream.Collectors.toList())
                        : new java.util.ArrayList<>())
                .build();
    }
    public ProjectResponse getProjectById(Long id, String email) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        boolean isOwner = project.getOwner().getEmail().equals(email);

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(email));

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per veure aquest projecte");
        }

        return mapToResponse(project);
    }
    public void sendInvitation(Long projectId, String emailToInvite, String ownerEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projecte no trobat"));

        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(ownerEmail));
        boolean isOwner = project.getOwner().getEmail().equals(ownerEmail);

        if (!isOwner && !isMember) {
            throw new RuntimeException("No tens permís per convidar");
        }

        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(u -> u.getEmail().equals(emailToInvite));
        if (alreadyMember) {
            throw new RuntimeException("Aquest usuari JA forma part del projecte!");
        }

        if (invitationRepository.findByReceiverEmailAndProjectId(emailToInvite, projectId).isPresent()) {
            throw new RuntimeException("Ja hi ha una invitació pendent per a aquest usuari");
        }

        User receiver = userRepository.findByEmail(emailToInvite)
                .orElseThrow(() -> new RuntimeException("L'usuari no existeix"));

        ProjectInvitation invitation = ProjectInvitation.builder()
                .receiverEmail(emailToInvite)
                .project(project)
                .build();

        invitationRepository.save(invitation);
    }

    public List<InvitationResponse> getUserInvitations(String email) {
        return invitationRepository.findByReceiverEmail(email).stream()
                .map(inv -> new InvitationResponse(
                        inv.getId(),
                        inv.getProject().getTitle(),
                        inv.getProject().getOwner().getUsername()
                )).toList();
    }

    @Transactional
    public void acceptInvitation(Long invitationId, String userEmail) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitació no trobada"));

        if (!invitation.getReceiverEmail().equals(userEmail)) {
            throw new RuntimeException("Aquesta invitació no és per a tu");
        }

        Project project = invitation.getProject();
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        if (!project.getMembers().contains(user)) {
            project.getMembers().add(user);
            projectRepository.save(project);
        }

        invitationRepository.delete(invitation);
    }

    public void declineInvitation(Long invitationId, String userEmail) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitació no trobada"));

        if (!invitation.getReceiverEmail().equals(userEmail)) {
            throw new RuntimeException("No autoritzat");
        }

        invitationRepository.delete(invitation);
    }
}
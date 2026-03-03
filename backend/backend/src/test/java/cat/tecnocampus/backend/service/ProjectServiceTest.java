package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.ProjectResponse;
import cat.tecnocampus.backend.repository.ProjectInvitationRepository;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectInvitationRepository invitationRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project dummyProject;
    private User dummyOwner;

    @BeforeEach
    void setUp() {
        dummyOwner = new User();
        dummyOwner.setId(1L);
        dummyOwner.setEmail("amo@test.com");
        dummyOwner.setUsername("AmoTest");

        dummyProject = new Project();
        dummyProject.setId(99L);
        dummyProject.setTitle("Projecte Test");
        dummyProject.setOwner(dummyOwner);
        dummyProject.setMembers(new ArrayList<>());
    }

    @Test
    void testGetProjectById_Success() {
        when(projectRepository.findById(99L)).thenReturn(Optional.of(dummyProject));

        ProjectResponse response = projectService.getProjectById(99L, "amo@test.com");

        assertNotNull(response);
        assertEquals("Projecte Test", response.getTitle());
    }

    @Test
    void testGetProjectsByUser_Success() {
        when(projectRepository.findAllProjectsForUser("amo@test.com")).thenReturn(List.of(dummyProject));

        List<ProjectResponse> result = projectService.getProjectsByUser("amo@test.com");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(projectRepository).findAllProjectsForUser("amo@test.com");
    }

    @Test
    void testDeleteProject_NotAuthorized() {
        when(projectRepository.findById(99L)).thenReturn(Optional.of(dummyProject));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectService.deleteProject(99L, "altre@test.com");
        });

        assertEquals("No autoritzat", exception.getMessage());
        verify(projectRepository, never()).delete(any());
    }
    @Test
    void testSendInvitation_Success() {
        // GIVEN: El projecte existeix, l'amo és correcte i el receptor NO és membre encara
        when(projectRepository.findById(99L)).thenReturn(Optional.of(dummyProject));
        when(userRepository.findByEmail("convidat@test.com")).thenReturn(Optional.of(new User()));
        when(invitationRepository.findByReceiverEmailAndProjectId("convidat@test.com", 99L)).thenReturn(Optional.empty());

        // WHEN: Enviem invitació (Projecte 99, convidat, amo)
        projectService.sendInvitation(99L, "convidat@test.com", "amo@test.com");

        // THEN: Verifiquem que s'ha guardat la invitació
        verify(invitationRepository, times(1)).save(any());
    }

    @Test
    void testSendInvitation_ThrowsExceptionWhenAlreadyMember() {
        // GIVEN: Simulem que l'usuari JA és membre de la llista
        User jaMembre = new User();
        jaMembre.setEmail("existent@test.com");
        dummyProject.getMembers().add(jaMembre);

        when(projectRepository.findById(99L)).thenReturn(Optional.of(dummyProject));

        // WHEN & THEN: Hauria d'explotar
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectService.sendInvitation(99L, "existent@test.com", "amo@test.com");
        });

        assertEquals("Aquest usuari JA forma part del projecte!", exception.getMessage());
    }
}
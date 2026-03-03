package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Sprint;
import cat.tecnocampus.backend.domain.SprintStatus;
import cat.tecnocampus.backend.domain.User; // <-- AFEGIT
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SprintServiceTest {

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private SprintService sprintService;

    private Sprint plannedSprint;
    private Project dummyProject;
    private User dummyOwner;

    @BeforeEach
    void setUp() {
        dummyOwner = new User();
        dummyOwner.setId(1L);
        dummyOwner.setEmail("test@test.com");

        dummyProject = new Project();
        dummyProject.setId(1L);
        dummyProject.setOwner(dummyOwner);

        plannedSprint = new Sprint();
        plannedSprint.setId(10L);
        plannedSprint.setName("Sprint Test");
        plannedSprint.setStatus(SprintStatus.PLANNED);
        plannedSprint.setProject(dummyProject);
        plannedSprint.setStartDate(LocalDate.now());
        plannedSprint.setEndDate(LocalDate.now().plusDays(7));
    }

    @Test
    void testStartSprint_Success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(dummyProject));
        when(sprintRepository.findById(10L)).thenReturn(Optional.of(plannedSprint));
        when(sprintRepository.findFirstByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(Optional.empty());
        when(sprintRepository.save(any(Sprint.class))).thenReturn(plannedSprint);

        var response = sprintService.startSprint(1L, 10L, "test@test.com");

        assertEquals("ACTIVE", response.getStatus());
        verify(sprintRepository, times(1)).save(plannedSprint);
    }

    @Test
    void testStartSprint_ThrowsExceptionWhenAnotherSprintIsActive() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(dummyProject));

        when(sprintRepository.findFirstByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(Optional.of(new Sprint()));


        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sprintService.startSprint(1L, 10L, "test@test.com");
        });

        assertEquals("No pots iniciar aquest Sprint perquè ja n'hi ha un d'actiu. Has de completar l'actual primer.", exception.getMessage());
        verify(sprintRepository, never()).save(any(Sprint.class));
    }
    @Test
    void testDeleteSprint_Success() {
        when(sprintRepository.findById(10L)).thenReturn(Optional.of(plannedSprint));
        // Simulem que l'usuari és l'amo del projecte per passar el check de seguretat

        sprintService.deleteSprint(1L, 10L,"test@test.com"); // Revisa si demana 2 IDs o ID i email

        verify(sprintRepository, times(1)).delete(plannedSprint);
    }
}
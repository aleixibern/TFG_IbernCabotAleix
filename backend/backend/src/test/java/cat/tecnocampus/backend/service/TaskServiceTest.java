package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Project;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.TaskStatus;
import cat.tecnocampus.backend.domain.TaskType;
import cat.tecnocampus.backend.domain.TaskPriority;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.repository.ProjectRepository;
import cat.tecnocampus.backend.repository.SprintRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SprintRepository sprintRepository;

    @InjectMocks
    private TaskService taskService;

    private User dummyOwner;
    private Project dummyProject;
    private Task dummyTask;
    private TaskRequest dummyRequest;

    @BeforeEach
    void setUp() {
        // Preparem l'amo
        dummyOwner = new User();
        dummyOwner.setId(1L);
        dummyOwner.setEmail("amo@test.com");
        dummyOwner.setUsername("Amo");

        // Preparem el projecte per evitar NullPointerExceptions
        dummyProject = new Project();
        dummyProject.setId(10L);
        dummyProject.setOwner(dummyOwner);
        dummyProject.setMembers(new ArrayList<>());

        // Preparem una tasca bàsica
        dummyTask = new Task();
        dummyTask.setId(100L);
        dummyTask.setTitle("Tasca existent");
        dummyTask.setDescription("Descripció");
        dummyTask.setStatus(TaskStatus.BACKLOG);
        dummyTask.setType(TaskType.TASK);
        dummyTask.setPriority(TaskPriority.MEDIUM);
        dummyTask.setProject(dummyProject);

        // Preparem un request per defecte
        dummyRequest = new TaskRequest();
        dummyRequest.setTitle("Nova Tasca");
        dummyRequest.setDescription("Nova Descripció");
        dummyRequest.setType("FEATURE");
        dummyRequest.setPriority("HIGH");
    }

    @Test
    void testCreateTask_Success() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(dummyProject));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task savedTask = invocation.getArgument(0);
            savedTask.setId(200L);
            savedTask.setStatus(TaskStatus.BACKLOG); // L'estat per defecte sol ser aquest
            return savedTask;
        });

        TaskResponse response = taskService.createTask(10L, dummyRequest, "amo@test.com");

        assertNotNull(response);
        assertEquals("Nova Tasca", response.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void testCreateTask_ThrowsExceptionWhenNotAuthorized() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(dummyProject));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.createTask(10L, dummyRequest, "intrus@test.com");
        });

        assertEquals("No autoritzat", exception.getMessage());
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void testGetTasksByProject_Success() {
        when(taskRepository.findByProjectId(10L)).thenReturn(List.of(dummyTask));

        List<TaskResponse> responses = taskService.getTasksByProject(10L, "amo@test.com");

        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
        assertEquals("Tasca existent", responses.get(0).getTitle());
    }

    @Test
    void testUpdateTaskStatus_Success() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(dummyTask));
        when(taskRepository.save(any(Task.class))).thenReturn(dummyTask);

        TaskResponse response = taskService.updateTaskStatus(100L, "IN_PROGRESS", "amo@test.com");

        assertNotNull(response);
        assertEquals("IN_PROGRESS", response.getStatus());
        verify(taskRepository, times(1)).save(dummyTask);
    }

    @Test
    void testDeleteTask_Success() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(dummyTask));

        taskService.deleteTask(100L, "amo@test.com");

        verify(taskRepository, times(1)).delete(dummyTask);
    }

    @Test
    void testDeleteTask_ThrowsExceptionWhenNotAuthorized() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(dummyTask));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.deleteTask(100L, "intrus@test.com");
        });

        assertEquals("No tens permís per esborrar aquesta tasca", exception.getMessage());
        verify(taskRepository, never()).delete(any(Task.class));
    }
}
package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(@PathVariable Long projectId, Principal principal) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, principal.getName()));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskResponse> createTask(@PathVariable Long projectId, @RequestBody TaskRequest request, Principal principal) {
        return ResponseEntity.ok(taskService.createTask(projectId, request, principal.getName()));
    }

    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable Long taskId, @RequestBody TaskRequest request, Principal principal) {
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, request.getStatus(), principal.getName()));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, Principal principal) {
        taskService.deleteTask(taskId, principal.getName());
        return ResponseEntity.ok().build();
    }
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long taskId, @RequestBody TaskRequest request, Principal principal) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request, principal.getName()));
    }
}
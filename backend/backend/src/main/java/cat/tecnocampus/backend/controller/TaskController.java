package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.TaskRequest;
import cat.tecnocampus.backend.dto.TaskResponse;
import cat.tecnocampus.backend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

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


    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, body.get("status"), principal.getName()));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @RequestBody TaskRequest request, Principal principal) {
        return ResponseEntity.ok(taskService.updateTask(id, request, principal.getName()));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Principal principal) {
        taskService.deleteTask(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
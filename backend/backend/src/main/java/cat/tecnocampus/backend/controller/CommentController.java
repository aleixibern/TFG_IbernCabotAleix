package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.CommentRequest;
import cat.tecnocampus.backend.dto.CommentResponse;
import cat.tecnocampus.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long taskId,
            @RequestBody CommentRequest request,
            Principal principal) {
        return ResponseEntity.ok(commentService.addComment(taskId, request, principal.getName()));
    }
}
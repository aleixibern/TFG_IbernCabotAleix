package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.Comment;
import cat.tecnocampus.backend.domain.Task;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.CommentRequest;
import cat.tecnocampus.backend.dto.CommentResponse;
import cat.tecnocampus.backend.repository.CommentRepository;
import cat.tecnocampus.backend.repository.TaskRepository;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // 1. Obtenir tots els comentaris d'una tasca
    public List<CommentResponse> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 2. Afegir un comentari nou
    public CommentResponse addComment(Long taskId, CommentRequest request, String userEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Tasca no trobada"));

        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        Comment comment = Comment.builder()
                .text(request.getText())
                .task(task)
                .author(author)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return mapToResponse(savedComment);
    }

    // 3. Mapejador a Response
    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .text(comment.getText())
                .authorName(comment.getAuthor().getUsername())
                .authorEmail(comment.getAuthor().getEmail())
                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : "")
                .build();
    }
}
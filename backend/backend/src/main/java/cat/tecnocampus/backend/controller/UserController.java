package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.UserResponse;
import cat.tecnocampus.backend.dto.UserUpdateRequest;
import cat.tecnocampus.backend.repository.UserRepository;
import cat.tecnocampus.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ProjectService projectService;


    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        return ResponseEntity.ok(UserResponse.builder()
                .username(user.getRealUsername())
                .email(user.getEmail())
                .build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UserUpdateRequest request,
            java.security.Principal principal) {

        return ResponseEntity.ok(projectService.updateUserProfile(principal.getName(), request));
    }
}
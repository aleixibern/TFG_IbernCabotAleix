package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.UserResponse;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        String email = principal.getName(); // Ara això torna l'email correctament

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuari no trobat"));

        return ResponseEntity.ok(UserResponse.builder()
                .username(user.getRealUsername())
                .email(user.getEmail())
                .build());
    }
}
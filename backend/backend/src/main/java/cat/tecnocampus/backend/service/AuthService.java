package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.RegisterRequest;
import cat.tecnocampus.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder; // Aquesta és l'eina de seguretat
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("L'email ja està registrat");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("El nom d'usuari ja existeix");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Mai text pla!
                .build();
        userRepository.save(user);
    }
}
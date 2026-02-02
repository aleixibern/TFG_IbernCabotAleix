package cat.tecnocampus.backend.service;

import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.dto.Login;
import cat.tecnocampus.backend.dto.Register;
import cat.tecnocampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(Register request) {
        // ... (el teu codi de registre existent es queda igual) ...
        // Només assegura't que fas servir passwordEncoder.encode(request.getPassword())

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
    }

    public String login(Login request) {
        // 1. Això valida l'usuari i la contrasenya automàticament
        // Si falla, llença una excepció i no continua
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Si arribem aquí, tot és correcte. Busquem l'usuari per generar el token.
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        // 3. Tornem el token
        return jwtService.generateToken(user);
    }
}
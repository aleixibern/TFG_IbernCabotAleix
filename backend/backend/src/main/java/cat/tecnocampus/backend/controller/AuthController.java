package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.AuthenticationResponse;
import cat.tecnocampus.backend.dto.GoogleLogin;
import cat.tecnocampus.backend.dto.Login;
import cat.tecnocampus.backend.dto.Register;
import cat.tecnocampus.backend.domain.User;
import cat.tecnocampus.backend.repository.UserRepository;
import cat.tecnocampus.backend.service.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String GOOGLE_CLIENT_ID = "769929631616-3l8td61vmac7ckbo2imahoodvuu3vuln.apps.googleusercontent.com"; // <-- REVISA QUE SIGUI EL TEU!

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody Register request) {
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody Login request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).build();
        }
        var jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
    }

    @PostMapping("/google")
    public ResponseEntity<AuthenticationResponse> googleLogin(@RequestBody GoogleLogin request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();


                String name = (String) payload.get("name");
                if (name == null || name.isEmpty()) {
                    name = email.split("@")[0];
                }

                var userOptional = userRepository.findByEmail(email);
                User user;

                if (userOptional.isPresent()) {
                    user = userOptional.get();
                    if (user.getUsername() == null || user.getUsername().isEmpty()) {
                        user.setUsername(name);
                        userRepository.save(user);
                    }
                } else {
                    // Creem usuari nou AMB NOM
                    user = User.builder()
                            .email(email)
                            .username(name)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .build();
                    userRepository.save(user);
                }

                var jwtToken = jwtService.generateToken(user);
                return ResponseEntity.ok(AuthenticationResponse.builder().token(jwtToken).build());
            } else {
                return ResponseEntity.status(401).build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
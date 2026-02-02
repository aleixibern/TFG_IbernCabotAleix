package cat.tecnocampus.backend.controller;

import cat.tecnocampus.backend.dto.Login;
import cat.tecnocampus.backend.dto.Register;
import cat.tecnocampus.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Register request) {
        authService.register(request);
        return ResponseEntity.ok("Usuari registrat");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Login request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
package cat.tecnocampus.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Definim la "Cadena de Seguretat" (Qui pot entrar i on)
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Desactivem CSRF perquè és una API REST sense estat (Stateless)
                .authorizeHttpRequests(auth -> auth
                        // AQUI és on obrim la porta al teu controlador de registre:
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated() // Tota la resta queda tancada
                );

        return http.build();
    }

    // 2. Definim l'eina d'encriptació (BCrypt)
    // Aquest és el Bean que el teu AuthService està demanant al constructor.
    // Compleix el requisit de l'apartat 6.3.3 del TFG.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
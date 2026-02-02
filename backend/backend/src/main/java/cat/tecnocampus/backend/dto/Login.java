package cat.tecnocampus.backend.dto;

import lombok.Data;

@Data
public class Login {
    private String email;
    private String password;
}
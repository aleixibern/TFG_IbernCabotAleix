package cat.tecnocampus.backend.dto;

import lombok.Data;

@Data
public class Register {
    private String username;
    private String email;
    private String password;
}
package com.example.leaveapproval.auth;

import com.example.leaveapproval.employee.Employee;
import com.example.leaveapproval.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Locale;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @SecurityRequirements
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase(Locale.ROOT), request.password()));
        Employee employee = (Employee) authentication.getPrincipal();
        String token = jwtService.createToken(employee.getEmail(), employee.getRole().name());
        return new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds(),
                employee.getRole().name(), employee.getFullName());
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record LoginResponse(
            String accessToken, String tokenType, long expiresInSeconds, String role, String fullName) {
    }
}

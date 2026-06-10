package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.LoginRequest;
import com.artur.cryptoportfolio.dto.MessageResponse;
import com.artur.cryptoportfolio.dto.RegisterRequest;
import com.artur.cryptoportfolio.dto.AuthResponse;
import com.artur.cryptoportfolio.dto.UserResponse;
import com.artur.cryptoportfolio.model.User;
import com.artur.cryptoportfolio.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public ResponseEntity<MessageResponse> register(RegisterRequest request) {
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("User with this email already exists"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new MessageResponse("User registered successfully"));
    }

    public ResponseEntity<?> login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Wrong password"));
        }

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, "Login successful"));
    }   

    public ResponseEntity<?> getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity   
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }

        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

}

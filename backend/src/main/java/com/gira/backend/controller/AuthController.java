package com.gira.backend.controller;

import com.gira.backend.dto.*;
import com.gira.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDTO>> login(
            @RequestBody LoginRequest request,
            HttpSession session) {
        
        log.debug("Login request for email: {}", request.getEmail());
        Optional<UserDTO> result = userService.login(request);
        if (result.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Invalid email or password."));
        }

        // Store user in session
        session.setAttribute("userId", result.get().getId());
        session.setAttribute("userRole", result.get().getRole());

        return ResponseEntity.ok(ApiResponse.ok("Login successful", result.get()));
    }

    /**
     * POST /api/auth/signup
     * Body: { name, email, password, role }
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserDTO>> signup(
            @RequestBody SignupRequest request,
            HttpSession session) {

        if (request.getName() == null || request.getName().isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Name is required."));
        if (request.getEmail() == null || !request.getEmail().contains("@"))
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid email is required."));
        if (request.getPassword() == null || request.getPassword().length() < 6)
            return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 6 characters."));

        Optional<UserDTO> result = userService.signup(request);
        if (result.isEmpty()) {
            return ResponseEntity.status(409)
                    .body(ApiResponse.error("An account with this email already exists."));
        }

        // Auto-login after signup
        session.setAttribute("userId", result.get().getId());
        session.setAttribute("userRole", result.get().getRole());

        return ResponseEntity.status(201).body(ApiResponse.ok("Account created successfully", result.get()));
    }

    /**
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    /**
     * GET /api/auth/me
     * Returns the currently logged-in user (from session).
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        log.debug("Checking session for userId: {}", userId);
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated."));
        }
        return userService.findById(userId)
                .map(u -> ResponseEntity.ok(ApiResponse.ok(u)))
                .orElse(ResponseEntity.ok(ApiResponse.error("User not found.")));
    }
}

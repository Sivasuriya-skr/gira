package com.gira.backend.controller;

import com.gira.backend.dto.ApiResponse;
import com.gira.backend.dto.UserDTO;
import com.gira.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * Returns all users (manager only in real app).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    /**
     * GET /api/users/providers
     * Returns all providers (used by manager when assigning tickets).
     */
    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getProviders() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllProviders()));
    }

    /**
     * GET /api/users/role/{role}
     * Returns all users with a specific role.
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable String role) {
        // Simple mapping: if role is provider, call the provider service
        if ("provider".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(ApiResponse.ok(userService.getAllProviders()));
        }
        // Generic implementation would go here, but for now we follow the requirement
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers().stream()
                .filter(u -> u.getRole().equalsIgnoreCase(role))
                .toList()));
    }

    /**
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(u -> ResponseEntity.ok(ApiResponse.ok(u)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("User not found.")));
    }
}

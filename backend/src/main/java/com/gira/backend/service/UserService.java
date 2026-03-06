package com.gira.backend.service;

import com.gira.backend.dto.LoginRequest;
import com.gira.backend.dto.SignupRequest;
import com.gira.backend.dto.UserDTO;
import com.gira.backend.model.User;
import com.gira.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── Auth ──────────────────────────────────────────────────────

    /**
     * Authenticate a user.
     * Returns a UserDTO on success, empty Optional on failure.
     */
    public Optional<UserDTO> login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(u -> u.getPassword().equals(request.getPassword()))
                .map(this::toDTO);
    }

    /**
     * Register a new user.
     * Returns empty Optional if email already taken.
     */
    public Optional<UserDTO> signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return Optional.empty();
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = User.Role.WORKER;
        }

        User user = new User(request.getName(), request.getEmail(), request.getPassword(), role);
        User saved = userRepository.save(user);
        return Optional.of(toDTO(saved));
    }

    // ── Queries ───────────────────────────────────────────────────

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(this::toDTO);
    }

    public Optional<User> findEntityById(Long id) {
        return userRepository.findById(id);
    }

    /** Return all providers (used by manager to assign tickets). */
    public List<UserDTO> getAllProviders() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PROVIDER)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Return all users (manager only). */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────

    public UserDTO toDTO(User user) {
        if (user == null) return null;
        return new com.gira.backend.dto.UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase()
        );
    }
}

package com.gira.backend.service;

import com.gira.backend.dto.LoginRequest;
import com.gira.backend.dto.SignupRequest;
import com.gira.backend.dto.UserDTO;
import com.gira.backend.model.User;
import com.gira.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Auth ──────────────────────────────────────────────────────

    public Optional<UserDTO> login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword())
                        || u.getPassword().equals(request.getPassword()))
                .map(this::toDTO);
    }

    public Optional<UserDTO> signup(SignupRequest request) {
        // 1. Reject duplicate emails
        if (userRepository.existsByEmail(request.getEmail())) {
            return Optional.empty();
        }

        // 2. Parse role
        User.Role role;
        try {
            String roleRaw = request.getRole() == null ? "" : request.getRole();
            role = User.Role.valueOf(roleRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            role = User.Role.WORKER;
        }

        String companyId;
        String companyName;

        if (role == User.Role.MANAGER) {
            // MANAGER: auto-generate a brand new unique company_id
            companyId = generateUniqueCompanyId();
            companyName = normalizeCompanyName(request.getCompanyName());

        } else {
            // WORKER / PROVIDER: verify the company_id they entered actually exists
            companyId = normalizeCompanyId(request.getCompanyId());

            if (companyId == null || !userRepository.existsByCompanyId(companyId)) {
                return Optional.empty();
            }

            // Inherit company name from the existing manager's record
            companyName = userRepository.findFirstByCompanyId(companyId) // ← fixed
                    .map(User::getCompanyName)
                    .orElse(null);
        }

        // 3. Build and save the user
        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role,
                companyId,
                companyName);

        User saved = userRepository.save(user);
        return Optional.of(toDTO(saved));
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Queries ───────────────────────────────────────────────────

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(this::toDTO);
    }

    public Optional<User> findEntityById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findEntityByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<UserDTO> getAllProviders() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PROVIDER)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────

    public UserDTO toDTO(User user) {
        if (user == null)
            return null;
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name().toLowerCase(),
                user.getCompanyId(),
                user.getCompanyName());
    }

    // ── Helpers ───────────────────────────────────────────────────

    public boolean companyIdExists(String companyId) {
        String normalized = normalizeCompanyId(companyId);
        if (normalized == null)
            return false;
        return userRepository.existsByCompanyId(normalized);
    }

    public String normalizeCompanyId(String companyId) {
        if (companyId == null)
            return null;
        String normalized = companyId.trim().toUpperCase();
        return normalized.isEmpty() ? null : normalized;
    }

    public String normalizeCompanyName(String companyName) {
        if (companyName == null)
            return null;
        String trimmed = companyName.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateUniqueCompanyId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String companyId;

        do {
            StringBuilder sb = new StringBuilder("GIRA-");
            for (int i = 0; i < 4; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            sb.append("-");
            for (int i = 0; i < 4; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            companyId = sb.toString();
        } while (userRepository.existsByCompanyId(companyId));

        return companyId;
    }
}
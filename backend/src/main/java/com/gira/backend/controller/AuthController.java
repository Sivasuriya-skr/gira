package com.gira.backend.controller;

import com.gira.backend.dto.*;
import com.gira.backend.model.User;
import com.gira.backend.model.PasswordResetToken;
import com.gira.backend.service.EmailService;
import com.gira.backend.service.OtpService;
import com.gira.backend.service.PasswordResetService;
import com.gira.backend.service.UserService;
import com.gira.backend.util.CompanyIdValidator;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService  userService;
    private final OtpService   otpService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;

    @Value("${app.cors.allowed-origins:http://localhost:5175}")
    private String allowedOrigins;

    public AuthController(UserService userService,
                          OtpService otpService,
                          EmailService emailService,
                          PasswordResetService passwordResetService) {
        this.userService  = userService;
        this.otpService   = otpService;
        this.emailService = emailService;
        this.passwordResetService = passwordResetService;
    }

    // ── OTP ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/send-otp
     * Body: { "email": "..." }
     * Generates a 6-digit OTP and emails it.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("A valid email address is required."));
        }
        try {
            String otp = otpService.generateAndStore(email);
            emailService.sendOtpEmail(email, otp);
            log.info("OTP dispatched for {}", email);
            return ResponseEntity.ok(ApiResponse.ok("OTP sent. Please check your inbox.", null));
        } catch (MailException e) {
            log.error("Mail send failure for {}: {}", email, e.getMessage());
            return ResponseEntity.status(502)
                    .body(ApiResponse.error("Failed to send email: " + e.getMessage()));
        }
    }

    // ── OTP ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/verify-otp
     * Body: { "email": "...", "otp": "123456" }
     * Returns ok=true when the code matches and hasn't expired.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email and OTP are required."));
        }
        boolean valid = otpService.verify(email, otp.trim());
        if (!valid) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Invalid or expired OTP. Please try again."));
        }
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully.", null));
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/forgot-password
     * Body: { "email": "..." }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid email is required."));
        }

        Optional<User> userOpt = userService.findEntityByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = passwordResetService.createResetTokenForUser(user);
            
            String frontendUrl = allowedOrigins.split(",")[0];
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            } catch (MailException e) {
                log.error("Email error: {}", e.getMessage());
                return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to send the reset link email."));
            }
        }
        
        // Always return success even if email not found to prevent email enumeration
        return ResponseEntity.ok(ApiResponse.ok("If that email exists, a password reset link has been sent.", null));
    }

    /**
     * POST /api/auth/reset-password
     * Body: { "token": "...", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token and new password are required."));
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetService.validatePasswordResetToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reset link expired. Please request a new one."));
        }

        PasswordResetToken passToken = tokenOpt.get();
        User user = passToken.getUser();
        
        userService.updatePassword(user, newPassword);
        passwordResetService.deleteToken(passToken);

        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully.", null));
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

        session.setAttribute("userId",   result.get().getId());
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

        String roleRaw = request.getRole() == null ? "" : request.getRole().toLowerCase();
        boolean isManager = roleRaw.equals("manager");
        boolean needsCompany = roleRaw.equals("worker") || roleRaw.equals("provider");
        String normalizedCompanyId = userService.normalizeCompanyId(request.getCompanyId());
        String normalizedCompanyName = userService.normalizeCompanyName(request.getCompanyName());

        if (needsCompany || isManager) {
            if (normalizedCompanyId == null) {
                String msg = needsCompany
                        ? "Company ID is required for workers and providers."
                        : "Company ID is required for managers to create a workspace.";
                return ResponseEntity.badRequest().body(ApiResponse.error(msg));
            }
            if (!CompanyIdValidator.isValid(normalizedCompanyId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid company ID format."));
            }
        }

        // Workers/Providers must join an existing company; Managers must not collide
        if (needsCompany && !userService.companyIdExists(normalizedCompanyId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company ID not found."));
        }
        if (isManager && userService.companyIdExists(normalizedCompanyId)) {
            return ResponseEntity.status(409).body(ApiResponse.error("Company ID already exists. Please choose another."));
        }

        if (isManager && normalizedCompanyName == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company name is required for managers."));
        }

        request.setCompanyId(normalizedCompanyId);
        request.setCompanyName(normalizedCompanyName);

        Optional<UserDTO> result = userService.signup(request);
        if (result.isEmpty()) {
            return ResponseEntity.status(409)
                    .body(ApiResponse.error("An account with this email already exists."));
        }

        session.setAttribute("userId",   result.get().getId());
        session.setAttribute("userRole", result.get().getRole());

        return ResponseEntity.ok(ApiResponse.ok("Account created successfully", result.get()));
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

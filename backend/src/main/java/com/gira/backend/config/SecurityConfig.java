package com.gira.backend.config;

import com.gira.backend.model.User;
import com.gira.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;
import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserRepository userRepository;

    @Value("${app.cors.allowed-origins:http://localhost:5175}")
    private String allowedOrigins;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            // Disable default authentication requirement for APIs 
            // since we handle sessions inside our controllers via HttpSession manually
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(this::onAuthenticationSuccess)
            );
            
        return http.build();
    }

    private void onAuthenticationSuccess(jakarta.servlet.http.HttpServletRequest request, 
                                         jakarta.servlet.http.HttpServletResponse response, 
                                         Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> userOpt = userRepository.findByEmail(email);

        // Get frontend application URL for redirect
        String frontendUrl = allowedOrigins.split(",")[0];

        if (userOpt.isEmpty()) {
            // Email not registered — deny login, redirect to login page with error
            response.sendRedirect(frontendUrl + "/login?error=account_not_found");
            return;
        }

        User user = userOpt.get();

        // Add user info into session
        HttpSession session = request.getSession();
        session.setAttribute("userId", user.getId());
        session.setAttribute("userRole", user.getRole().name().toLowerCase());

        // Redirect to root; AuthContext will pick up the session and route to the dashboard
        response.sendRedirect(frontendUrl + "/");
    }
}

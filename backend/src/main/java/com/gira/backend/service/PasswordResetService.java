package com.gira.backend.service;

import com.gira.backend.model.PasswordResetToken;
import com.gira.backend.model.User;
import com.gira.backend.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Transactional
    public String createResetTokenForUser(User user) {
        // Delete any existing tokens for this user first so we only have one active
        tokenRepository.deleteByUser(user);

        // Generate secure random UUID token
        String token = UUID.randomUUID().toString();
        
        // Token expires in 10 minutes
        PasswordResetToken myToken = new PasswordResetToken(token, user, LocalDateTime.now().plusMinutes(10));
        tokenRepository.save(myToken);
        
        return token;
    }

    public Optional<PasswordResetToken> validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> passTokenOpt = tokenRepository.findByToken(token);
        
        if (passTokenOpt.isEmpty()) {
            return Optional.empty(); // invalid token
        }
        
        PasswordResetToken passToken = passTokenOpt.get();
        if (passToken.isExpired()) {
            tokenRepository.delete(passToken);
            return Optional.empty(); // expired token
        }
        
        return passTokenOpt;
    }
    
    @Transactional
    public void deleteToken(PasswordResetToken token) {
        tokenRepository.delete(token);
    }
}

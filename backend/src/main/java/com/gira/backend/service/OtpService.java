package com.gira.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generates, stores, and verifies 6-digit OTPs for email verification.
 * OTPs are stored in-memory with a configurable expiry window.
 */
@Service
public class OtpService {

    @Value("${app.otp.expiry-minutes:10}")
    private int expiryMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    // email -> (otp, expiryInstant)
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    /**
     * Generates a new 6-digit OTP for the given email and stores it.
     * Any previous OTP for the same email is replaced.
     *
     * @param email the user's email address
     * @return the generated OTP string
     */
    public String generateAndStore(String email) {
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiry = Instant.now().plusSeconds(expiryMinutes * 60L);
        store.put(email.toLowerCase(), new OtpEntry(otp, expiry));
        return otp;
    }

    /**
     * Verifies whether the provided OTP matches the stored one and hasn't expired.
     * If valid, the OTP is consumed (deleted) so it can't be reused.
     *
     * @param email the user's email address
     * @param otp   the OTP submitted by the user
     * @return true if correct and not expired, false otherwise
     */
    public boolean verify(String email, String otp) {
        OtpEntry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiry())) {
            store.remove(email.toLowerCase());
            return false;
        }
        if (!entry.otp().equals(otp)) return false;
        store.remove(email.toLowerCase()); // consume
        return true;
    }

    // ── Inner record ──────────────────────────────────────────────
    private record OtpEntry(String otp, Instant expiry) {}
}

package com.gira.backend.config;

import com.gira.backend.model.Ticket;
import com.gira.backend.model.User;
import com.gira.backend.repository.TicketRepository;
import com.gira.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with default users and sample tickets on startup.
 * Mirrors the hardcoded credentials used in the frontend AuthContext.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public DataInitializer(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(String... args) {
        // Database initialization has been cleared per user request.
        log.info("Database seeding is disabled. Starting with an empty database.");
    }
}

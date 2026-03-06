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
        if (userRepository.count() > 0) return;   // already seeded

        // ── Default users ─────────────────────────────────────────────
        User manager = userRepository.save(
                new User("Admin User", "admin@gira.com", "admin123", User.Role.MANAGER));

        User worker = userRepository.save(
                new User("Worker User", "worker@gira.com", "worker123", User.Role.WORKER));

        User provider = userRepository.save(
                new User("Service Provider", "provider@gira.com", "provider123", User.Role.PROVIDER));

        // ── Extra providers (for assignment demo) ─────────────────────
        User jane = userRepository.save(
                new User("Jane Smith", "jane@gira.com", "jane@gira.com", User.Role.PROVIDER));

        User mike = userRepository.save(
                new User("Mike Wilson", "mike@gira.com", "mike@gira.com", User.Role.PROVIDER));

        // ── Extra worker ──────────────────────────────────────────────
        User bob = userRepository.save(
                new User("Bob Smith", "bob@gira.com", "bob@gira.com", User.Role.WORKER));

        // ── Sample tickets ─────────────────────────────────────────────
        Ticket t1 = new Ticket();
        t1.setTitle("System Login Issue");
        t1.setDescription("Users are unable to log in to the system after the latest update.");
        t1.setPriority(Ticket.Priority.HIGH);
        t1.setStatus(Ticket.Status.RESOLVED);
        t1.setWorker(worker);
        t1.setProvider(provider);
        ticketRepository.save(t1);

        Ticket t2 = new Ticket();
        t2.setTitle("Performance Issue");
        t2.setDescription("Dashboard is loading slowly for all users during peak hours.");
        t2.setPriority(Ticket.Priority.MEDIUM);
        t2.setStatus(Ticket.Status.IN_PROGRESS);
        t2.setWorker(bob);
        t2.setProvider(jane);
        ticketRepository.save(t2);

        Ticket t3 = new Ticket();
        t3.setTitle("Database Connection Error");
        t3.setDescription("Service is throwing intermittent database connection timeouts.");
        t3.setPriority(Ticket.Priority.HIGH);
        t3.setStatus(Ticket.Status.PENDING);
        t3.setWorker(worker);
        ticketRepository.save(t3);

        log.info("✅ GIRA database seeded: {} users, {} tickets",
                userRepository.count(), ticketRepository.count());
    }
}

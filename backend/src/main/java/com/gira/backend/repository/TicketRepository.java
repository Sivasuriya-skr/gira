package com.gira.backend.repository;

import com.gira.backend.model.Ticket;
import com.gira.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Tickets raised by a specific worker
    List<Ticket> findByWorker(User worker);

    // Tickets assigned to a specific provider
    List<Ticket> findByProvider(User provider);

    // Tickets by status
    List<Ticket> findByStatus(Ticket.Status status);

    // Tickets by worker and status
    List<Ticket> findByWorkerAndStatus(User worker, Ticket.Status status);
}

package com.gira.backend.repository;

import com.gira.backend.model.TicketActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketActivityRepository extends JpaRepository<TicketActivity, Long> {
    List<TicketActivity> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}

package com.gira.backend.controller;

import com.gira.backend.dto.*;
import com.gira.backend.service.TicketService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * GET /api/tickets
     * Managers see all tickets.
     * Workers see their own tickets (pass ?workerId=).
     * Providers see their assigned tickets (pass ?providerId=).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketDTO>>> getTickets(
            @RequestParam(required = false) Long workerId,
            @RequestParam(required = false) Long providerId) {

        List<TicketDTO> tickets;

        if (workerId != null) {
            tickets = ticketService.getTicketsByWorker(workerId);
        } else if (providerId != null) {
            tickets = ticketService.getTicketsByProvider(providerId);
        } else {
            tickets = ticketService.getAllTickets();
        }

        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    /**
     * GET /api/tickets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDTO>> getTicket(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(t -> ResponseEntity.ok(ApiResponse.ok(t)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket not found.")));
    }

    /**
     * POST /api/tickets
     * Create a new ticket (worker).
     * Body: { title, description, priority, workerId }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TicketDTO>> createTicket(
            @RequestBody TicketRequest request) {

        return ticketService.createTicket(request)
                .map(t -> ResponseEntity.status(201).body(ApiResponse.ok("Ticket created", t)))
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Invalid worker ID.")));
    }

    /**
     * PATCH /api/tickets/{id}/assign
     * Assign a provider to a ticket (manager).
     * Body: { providerId }
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketDTO>> assignProvider(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {

        Long providerId = body.get("providerId");
        if (providerId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("providerId is required."));
        }
        return ticketService.assignProvider(id, providerId)
                .map(t -> ResponseEntity.ok(ApiResponse.ok("Provider assigned", t)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket or provider not found.")));
    }

    /**
     * PATCH /api/tickets/{id}/status
     * Update ticket status (provider or manager).
     * Body: { status }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("status is required."));
        }
        return ticketService.updateStatus(id, status)
                .map(t -> ResponseEntity.ok(ApiResponse.ok("Status updated", t)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket not found.")));
    }

    /**
     * DELETE /api/tickets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        if (ticketService.deleteTicket(id)) {
            return ResponseEntity.ok(ApiResponse.ok("Ticket deleted", null));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Ticket not found."));
    }
}

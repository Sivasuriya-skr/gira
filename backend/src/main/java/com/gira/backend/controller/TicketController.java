package com.gira.backend.controller;

import com.gira.backend.dto.*;
import com.gira.backend.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ResponseEntity<ApiResponse<TicketDTO>> assignProviderPatch(
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
     * POST /api/tickets/{id}/assign
     * Assign a provider to a ticket (manager) with email notification.
     * Body: { providerId, managerName }
     */
    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketDTO>> assignProviderPost(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Object providerIdObj = body.get("providerId");
        String managerName = (String) body.get("managerName");

        if (providerIdObj == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("providerId is required."));
        }

        Long providerId = Long.valueOf(providerIdObj.toString());

        if (managerName == null || managerName.isBlank()) {
            managerName = "GIRA Manager";
        }

        try {
            return ticketService.assignProvider(id, providerId, managerName)
                    .map(t -> ResponseEntity
                            .ok(ApiResponse.ok("Ticket assigned successfully and notification sent to provider", t)))
                    .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket or provider not found.")));
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TicketController.class).error("Error assigning ticket: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Error assigning ticket: " + e.getMessage()));
        }
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
     * PATCH /api/tickets/{id}/resolution-date
     * Set expected resolution date (provider).
     * Body: { date: "ISO-8601-string" }
     */
    @PatchMapping("/{id}/resolution-date")
    public ResponseEntity<ApiResponse<TicketDTO>> setResolutionDate(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String dateStr = body.get("date");
        if (dateStr == null || dateStr.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("date is required."));
        }
        try {
            java.time.LocalDateTime date = java.time.LocalDateTime.parse(dateStr);
            return ticketService.setResolutionDate(id, date)
                    .map(t -> ResponseEntity.ok(ApiResponse.ok("Resolution date set", t)))
                    .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket not found.")));
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid date format. Use ISO-8601."));
        }
    }

    /**
     * PATCH /api/tickets/{id}/complete
     * Resolve ticket and send summary email (provider).
     * Body: { summary: "..." }
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TicketDTO>> completeTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String summary = body.get("summary");
        Optional<TicketDTO> updated = ticketService.updateStatus(id, "resolved");

        if (updated.isPresent()) {
            TicketDTO dto = updated.get();
            if (summary != null && !summary.isBlank()) {
                ticketService.sendCompletionSummary(id, summary);
            }
            return ResponseEntity.ok(ApiResponse.ok("Ticket resolved successfully", dto));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Ticket not found."));
    }

    /**
     * POST /api/tickets/{id}/email
     * Send a custom email (Gmail theme) related to a ticket.
     * Body: { to: "manager"|"worker", subject: "...", body: "..." }
     */
    @PostMapping("/{id}/email")
    public ResponseEntity<ApiResponse<Void>> sendTicketEmail(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String recipientType = payload.get("to");
        String subject = payload.get("subject");
        String body = payload.get("body");

        if (recipientType == null || subject == null || body == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Required fields: to, subject, body"));
        }

        boolean success = ticketService.sendCustomTicketEmail(id, recipientType, subject, body);
        if (success) {
            return ResponseEntity.ok(ApiResponse.ok("Email sent successfully", null));
        } else {
            return ResponseEntity.status(404).body(ApiResponse.error("Ticket or recipient not found."));
        }
    }

    /**
     * PATCH /api/tickets/{id}/forward
     * Forward ticket back to manager with a reason (provider).
     * Body: { providerId, reason }
     */
    @PatchMapping("/{id}/forward")
    public ResponseEntity<ApiResponse<TicketDTO>> forwardTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        
        Object pId = body.get("providerId");
        String reason = (String) body.get("reason");
        
        if (pId == null || reason == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("providerId and reason are required."));
        }
        
        Long providerId = Long.valueOf(pId.toString());
        
        return ticketService.forwardTicket(id, providerId, reason)
                .map(t -> ResponseEntity.ok(ApiResponse.ok("Ticket forwarded to manager", t)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Ticket not found.")));
    }

    /**
     * GET /api/tickets/{id}/activity
     * Get full activity log for a ticket (manager).
     */
    @GetMapping("/{id}/activity")
    public ResponseEntity<ApiResponse<List<TicketActivityDTO>>> getTicketActivity(@PathVariable Long id) {
        List<TicketActivityDTO> activities = ticketService.getTicketActivity(id);
        return ResponseEntity.ok(ApiResponse.ok(activities));
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

package com.gira.backend.service;

import com.gira.backend.dto.TicketDTO;
import com.gira.backend.dto.TicketRequest;
import com.gira.backend.model.Ticket;
import com.gira.backend.model.User;
import com.gira.backend.repository.TicketRepository;
import com.gira.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         UserService userService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    // ── CRUD ──────────────────────────────────────────────────────

    /** Create a new ticket (raised by a worker). */
    public Optional<TicketDTO> createTicket(TicketRequest request) {
        User worker = userRepository.findById(request.getWorkerId()).orElse(null);
        if (worker == null) return Optional.empty();

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(parsePriority(request.getPriority()));
        ticket.setWorker(worker);

        if (request.getProviderId() != null) {
            userRepository.findById(request.getProviderId()).ifPresent(ticket::setProvider);
        }

        Ticket saved = ticketRepository.save(ticket);
        return Optional.of(toDTO(saved));
    }

    /** Get all tickets (manager view). */
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Get tickets raised by a specific worker. */
    public List<TicketDTO> getTicketsByWorker(Long workerId) {
        return userRepository.findById(workerId)
                .map(worker -> ticketRepository.findByWorker(worker).stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    /** Get tickets assigned to a specific provider. */
    public List<TicketDTO> getTicketsByProvider(Long providerId) {
        return userRepository.findById(providerId)
                .map(provider -> ticketRepository.findByProvider(provider).stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    /** Get a single ticket by ID. */
    public Optional<TicketDTO> getTicketById(Long id) {
        return ticketRepository.findById(id).map(this::toDTO);
    }

    /** Assign a provider to a ticket and move it to IN_PROGRESS. */
    public Optional<TicketDTO> assignProvider(Long ticketId, Long providerId) {
        return ticketRepository.findById(ticketId).flatMap(ticket ->
                userRepository.findById(providerId).map(provider -> {
                    ticket.setProvider(provider);
                    ticket.setStatus(Ticket.Status.IN_PROGRESS);
                    return toDTO(ticketRepository.save(ticket));
                }));
    }

    /** Update the status of a ticket. */
    public Optional<TicketDTO> updateStatus(Long ticketId, String statusStr) {
        return ticketRepository.findById(ticketId).map(ticket -> {
            try {
                Ticket.Status newStatus = Ticket.Status.valueOf(
                        statusStr.toUpperCase().replace("-", "_"));
                ticket.setStatus(newStatus);
            } catch (IllegalArgumentException ignored) {}
            return toDTO(ticketRepository.save(ticket));
        });
    }

    /** Delete a ticket. */
    public boolean deleteTicket(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) return false;
        ticketRepository.deleteById(ticketId);
        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Ticket.Priority parsePriority(String p) {
        if (p == null) return Ticket.Priority.MEDIUM;
        try {
            return Ticket.Priority.valueOf(p.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Ticket.Priority.MEDIUM;
        }
    }

    private String formatStatus(Ticket.Status status) {
        return switch (status) {
            case IN_PROGRESS -> "in-progress";
            default -> status.name().toLowerCase();
        };
    }

    public TicketDTO toDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setTicketNumber(String.format("TKT-%04d", ticket.getId()));
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(formatStatus(ticket.getStatus()));
        dto.setPriority(ticket.getPriority().name().toLowerCase());
        dto.setWorker(userService.toDTO(ticket.getWorker()));
        dto.setProvider(userService.toDTO(ticket.getProvider()));
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }
}

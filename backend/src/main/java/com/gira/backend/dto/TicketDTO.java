package com.gira.backend.dto;

import java.time.LocalDateTime;

/**
 * Safe ticket data returned to the frontend.
 */
public class TicketDTO {

    private Long id;
    private String ticketNumber;   // e.g. "TKT-0001"
    private String title;
    private String description;
    private String status;         // lowercase: "pending" | "in-progress" | "resolved" | "closed"
    private String priority;       // lowercase: "low" | "medium" | "high"
    private UserDTO worker;
    private UserDTO provider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expectedResolutionDate;

    public TicketDTO() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                            { return id; }
    public void setId(Long id)                     { this.id = id; }

    public String getTicketNumber()                { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getTitle()                       { return title; }
    public void setTitle(String title)             { this.title = title; }

    public String getDescription()                 { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus()                      { return status; }
    public void setStatus(String status)           { this.status = status; }

    public String getPriority()                    { return priority; }
    public void setPriority(String priority)       { this.priority = priority; }

    public UserDTO getWorker()                     { return worker; }
    public void setWorker(UserDTO worker)          { this.worker = worker; }

    public UserDTO getProvider()                   { return provider; }
    public void setProvider(UserDTO provider)      { this.provider = provider; }

    public LocalDateTime getCreatedAt()            { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt()            { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getExpectedResolutionDate() { return expectedResolutionDate; }
    public void setExpectedResolutionDate(LocalDateTime expectedResolutionDate) { this.expectedResolutionDate = expectedResolutionDate; }
}

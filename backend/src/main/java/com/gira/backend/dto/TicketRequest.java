package com.gira.backend.dto;

/**
 * Payload for creating or updating a ticket.
 */
public class TicketRequest {

    private String title;
    private String description;
    private String priority;      // "low" | "medium" | "high"
    private Long workerId;
    private Long providerId;      // nullable on creation

    public TicketRequest() {}

    public String getTitle()                       { return title; }
    public void setTitle(String title)             { this.title = title; }

    public String getDescription()                 { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority()                    { return priority; }
    public void setPriority(String priority)       { this.priority = priority; }

    public Long getWorkerId()                      { return workerId; }
    public void setWorkerId(Long workerId)         { this.workerId = workerId; }

    public Long getProviderId()                    { return providerId; }
    public void setProviderId(Long providerId)     { this.providerId = providerId; }
}

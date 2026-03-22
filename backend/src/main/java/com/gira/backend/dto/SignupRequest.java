package com.gira.backend.dto;

/**
 * Payload sent by the frontend on signup.
 */
public class SignupRequest {

    private String name;
    private String email;
    private String password;
    private String role;          // "worker" | "provider" | "manager"
    private String companyId;     // optional: required for worker/provider joins
    private String companyName;   // optional: stored alongside companyId

    public SignupRequest() {}

    public String getName()                    { return name; }
    public void setName(String name)           { this.name = name; }

    public String getEmail()                   { return email; }
    public void setEmail(String email)         { this.email = email; }

    public String getPassword()                { return password; }
    public void setPassword(String password)   { this.password = password; }

    public String getRole()                    { return role; }
    public void setRole(String role)           { this.role = role; }

    public String getCompanyId()               { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName()                 { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}

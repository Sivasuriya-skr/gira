package com.gira.backend.controller;

import com.gira.backend.dto.ApiResponse;
import com.gira.backend.util.CompanyIdValidator;
import com.gira.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final UserService userService;

    public CompanyController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/companies/verify
     * Body: { companyId }
     * Returns success if the ID matches the expected format (manager-generated).
     * In a fuller implementation this would check persistence.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyCompany(@RequestBody CompanyVerifyRequest request) {
        if (request == null || request.getCompanyId() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Company ID is required."));
        }
        String cid = userService.normalizeCompanyId(request.getCompanyId());
        if (!CompanyIdValidator.isValid(cid)) {
            return ResponseEntity.ok(ApiResponse.error("Invalid company ID."));
        }
        if (!userService.companyIdExists(cid)) {
            return ResponseEntity.ok(ApiResponse.error("Company ID not found."));
        }
        return ResponseEntity.ok(ApiResponse.ok(true));
    }

    // Simple request DTO to avoid polluting other models
    public static class CompanyVerifyRequest {
        private String companyId;
        public String getCompanyId() { return companyId; }
        public void setCompanyId(String companyId) { this.companyId = companyId; }
    }
}

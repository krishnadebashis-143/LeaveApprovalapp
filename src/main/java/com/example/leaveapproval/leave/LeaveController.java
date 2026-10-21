package com.example.leaveapproval.leave;

import com.example.leaveapproval.leave.LeaveDtos.CreateLeaveRequest;
import com.example.leaveapproval.leave.LeaveDtos.DecisionRequest;
import com.example.leaveapproval.leave.LeaveDtos.LeaveResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeaveResponse apply(@Valid @RequestBody CreateLeaveRequest request, Authentication authentication) {
        return leaveService.apply(authentication.getName(), request);
    }

    @GetMapping("/mine")
    public Page<LeaveResponse> mine(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") @Min(0) int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return leaveService.findMine(authentication.getName(),
                PageRequest.of(page, size, Sort.by("startDate").descending()));
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Page<LeaveResponse> inbox(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") @Min(0) int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return leaveService.findInbox(authentication.getName(),
                PageRequest.of(page, size, Sort.by("startDate").ascending()));
    }

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public LeaveResponse decide(
            @PathVariable @Min(1) Long id,
            @Valid @RequestBody DecisionRequest request,
            Authentication authentication) {
        return leaveService.decide(authentication.getName(), id, request);
    }
}

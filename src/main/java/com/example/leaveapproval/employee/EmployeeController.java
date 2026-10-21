package com.example.leaveapproval.employee;

import com.example.leaveapproval.employee.EmployeeDtos.AdminEmployee;
import com.example.leaveapproval.employee.EmployeeDtos.EmployeeProfile;
import com.example.leaveapproval.employee.EmployeeDtos.EmployeeSummary;
import com.example.leaveapproval.leave.LeaveService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;

    public EmployeeController(EmployeeService employeeService, LeaveService leaveService) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public Page<EmployeeSummary> searchEmployees(
            @RequestParam(required = false) @Size(max = 120) String name,
            @RequestParam(required = false) @Size(max = 100) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate joinedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate joinedTo,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return employeeService.search(name, department, joinedFrom, joinedTo,
                PageRequest.of(page, size, Sort.by("fullName").ascending()))
                .map(EmployeeSummary::from);
    }

    @GetMapping("/employees/me")
    public EmployeeProfile currentProfile(Authentication authentication) {
        return EmployeeProfile.from(employeeService.findByEmail(authentication.getName()));
    }

    @GetMapping("/employees/me/leave-balance")
    public EmployeeDtos.LeaveBalance currentLeaveBalance(Authentication authentication) {
        return leaveService.getBalance(authentication.getName());
    }

    @GetMapping("/admin/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminEmployee> searchAdminEmployees(
            @RequestParam(required = false) @Size(max = 120) String name,
            @RequestParam(required = false) @Size(max = 100) String department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate joinedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate joinedTo,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return employeeService.search(name, department, joinedFrom, joinedTo,
                PageRequest.of(page, size, Sort.by("fullName").ascending()))
                .map(AdminEmployee::from);
    }
}

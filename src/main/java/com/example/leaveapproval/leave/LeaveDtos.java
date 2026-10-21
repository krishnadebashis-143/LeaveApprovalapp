package com.example.leaveapproval.leave;

import com.example.leaveapproval.employee.Employee;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;

public final class LeaveDtos {

    private LeaveDtos() {
    }

    public record CreateLeaveRequest(
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotBlank @Size(max = 500) String reason) {
    }

    public record DecisionRequest(
            @NotNull LeaveDecision decision,
            @Size(max = 500) String reviewerNote) {
    }

    public record LeaveResponse(
            Long id,
            Long employeeId,
            String employeeName,
            String employeeEmail,
            String department,
            LocalDate startDate,
            LocalDate endDate,
            int daysRequested,
            String reason,
            LeaveStatus status,
            String reviewedBy,
            Instant reviewedAt,
            String reviewerNote) {
        public static LeaveResponse from(LeaveRequest leave) {
            Employee employee = leave.getEmployee();
            return new LeaveResponse(leave.getId(), employee.getId(), employee.getFullName(),
                    employee.getEmail(), employee.getDepartment(), leave.getStartDate(),
                    leave.getEndDate(), leave.getDaysRequested(), leave.getReason(), leave.getStatus(),
                    leave.getReviewedBy() == null ? null : leave.getReviewedBy().getFullName(),
                    leave.getReviewedAt(), leave.getReviewerNote());
        }
    }
}

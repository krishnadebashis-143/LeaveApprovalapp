package com.example.leaveapproval.leave;

import com.example.leaveapproval.common.BadRequestException;
import com.example.leaveapproval.common.ConflictException;
import com.example.leaveapproval.common.ForbiddenException;
import com.example.leaveapproval.common.NotFoundException;
import com.example.leaveapproval.employee.Employee;
import com.example.leaveapproval.employee.EmployeeRepository;
import com.example.leaveapproval.employee.EmployeeDtos.LeaveBalance;
import com.example.leaveapproval.employee.Role;
import com.example.leaveapproval.leave.LeaveDtos.CreateLeaveRequest;
import com.example.leaveapproval.leave.LeaveDtos.DecisionRequest;
import com.example.leaveapproval.leave.LeaveDtos.LeaveResponse;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(LeaveRequestRepository leaveRepository, EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public LeaveResponse apply(String email, CreateLeaveRequest request) {
        if (request.startDate().isAfter(request.endDate())) {
            throw new BadRequestException("startDate must be on or before endDate");
        }
        if (request.startDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Leave cannot start in the past");
        }

        Employee employee = employeeRepository.findByEmailForUpdate(email)
                .orElseThrow(() -> new NotFoundException("Employee account not found"));
        long daysRequested = LeaveDayCounter.countWeekdays(request.startDate(), request.endDate());
        if (daysRequested == 0) {
            throw new BadRequestException("The selected dates contain no working days");
        }
        if (leaveRepository.existsOverlappingRequest(
                employee.getId(), request.startDate(), request.endDate())) {
            throw new ConflictException("This leave overlaps an existing pending or approved request");
        }

        long pendingDays = leaveRepository.sumDaysByEmployeeAndStatus(employee.getId(), LeaveStatus.PENDING);
        long availableToRequest = employee.getAnnualLeaveBalance() - pendingDays;
        if (daysRequested > availableToRequest) {
            throw new ConflictException("Insufficient leave balance: "
                    + Math.max(availableToRequest, 0) + " working days are available");
        }

        LeaveRequest leave = leaveRepository.save(new LeaveRequest(employee, request.startDate(),
                request.endDate(), Math.toIntExact(daysRequested), request.reason().trim()));
        return LeaveResponse.from(leave);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> findMine(String email, Pageable pageable) {
        return leaveRepository.findAllByEmployee_EmailOrderByStartDateDesc(email, pageable)
                .map(LeaveResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<LeaveResponse> findInbox(String email, Pageable pageable) {
        Employee reviewer = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Employee account not found"));
        Page<LeaveRequest> requests = reviewer.getRole() == Role.ADMIN
                ? leaveRepository.findAllByStatusOrderByStartDateAsc(LeaveStatus.PENDING, pageable)
                : leaveRepository.findByStatusAndEmployeeDepartment(
                        LeaveStatus.PENDING, reviewer.getDepartment(), pageable);
        return requests.map(LeaveResponse::from);
    }

    @Transactional
    public LeaveResponse decide(String reviewerEmail, Long leaveId, DecisionRequest request) {
        Employee reviewer = employeeRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new NotFoundException("Reviewer account not found"));
        LeaveRequest leave = leaveRepository.findByIdForUpdate(leaveId)
                .orElseThrow(() -> new NotFoundException("Leave request not found"));

        if (reviewer.getRole() != Role.ADMIN
                && !reviewer.getDepartment().equalsIgnoreCase(leave.getEmployee().getDepartment())) {
            throw new ForbiddenException("Managers can only review requests from their department");
        }
        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new ConflictException("Only pending leave requests can be reviewed");
        }

        if (request.decision() == LeaveDecision.REJECT) {
            if (request.reviewerNote() == null || request.reviewerNote().isBlank()) {
                throw new BadRequestException("A reviewerNote is required when rejecting a request");
            }
            leave.review(LeaveStatus.REJECTED, reviewer, request.reviewerNote().trim());
        } else {
            Employee employee = employeeRepository.findByIdForUpdate(leave.getEmployee().getId())
                    .orElseThrow(() -> new NotFoundException("Employee account not found"));
            if (employee.getAnnualLeaveBalance() < leave.getDaysRequested()) {
                throw new ConflictException("Insufficient leave balance to approve this request");
            }
            employee.setAnnualLeaveBalance(employee.getAnnualLeaveBalance() - leave.getDaysRequested());
            leave.review(LeaveStatus.APPROVED, reviewer, normalizeNote(request.reviewerNote()));
        }
        return LeaveResponse.from(leave);
    }

    @Transactional(readOnly = true)
    public LeaveBalance getBalance(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Employee account not found"));
        long pendingDays = leaveRepository.sumDaysByEmployeeAndStatus(
                employee.getId(), LeaveStatus.PENDING);
        return new LeaveBalance(employee.getAnnualLeaveBalance(), Math.toIntExact(pendingDays),
                Math.toIntExact(Math.max(employee.getAnnualLeaveBalance() - pendingDays, 0)));
    }

    private String normalizeNote(String note) {
        return note == null || note.isBlank() ? null : note.trim();
    }
}

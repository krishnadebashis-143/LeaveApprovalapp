package com.example.leaveapproval.leave;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.leaveapproval.common.ConflictException;
import com.example.leaveapproval.employee.Employee;
import com.example.leaveapproval.employee.EmployeeRepository;
import com.example.leaveapproval.leave.LeaveDtos.CreateLeaveRequest;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRequestRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private LeaveService leaveService;
    private Employee employee;

    @BeforeEach
    void setUp() {
        leaveService = new LeaveService(leaveRepository, employeeRepository);
        employee = mock(Employee.class);
        when(employee.getId()).thenReturn(7L);
        when(employeeRepository.findByEmailForUpdate("employee@example.com"))
                .thenReturn(Optional.of(employee));
    }

    @Test
    void blocksOverlappingRequests() {
        LocalDate start = nextMonday();
        when(leaveRepository.existsOverlappingRequest(7L, start, start)).thenReturn(true);

        assertThatThrownBy(() -> leaveService.apply("employee@example.com",
                new CreateLeaveRequest(start, start, "Personal leave")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("overlaps");
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void blocksRequestsThatExceedTheRemainingBalance() {
        LocalDate start = nextMonday();
        when(employee.getAnnualLeaveBalance()).thenReturn(2);
        LocalDate end = start.plusDays(4);
        when(leaveRepository.existsOverlappingRequest(7L, start, end)).thenReturn(false);
        when(leaveRepository.sumDaysByEmployeeAndStatus(7L, LeaveStatus.PENDING)).thenReturn(0L);

        assertThatThrownBy(() -> leaveService.apply("employee@example.com",
                new CreateLeaveRequest(start, end, "Personal leave")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Insufficient leave balance");
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    @Test
    void includesPendingRequestsWhenCheckingAvailableBalance() {
        LocalDate start = nextMonday();
        when(employee.getAnnualLeaveBalance()).thenReturn(5);
        when(leaveRepository.existsOverlappingRequest(7L, start, start)).thenReturn(false);
        when(leaveRepository.sumDaysByEmployeeAndStatus(7L, LeaveStatus.PENDING)).thenReturn(5L);

        assertThatThrownBy(() -> leaveService.apply("employee@example.com",
                new CreateLeaveRequest(start, start, "Personal leave")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Insufficient leave balance");
        verify(leaveRepository, never()).save(any(LeaveRequest.class));
    }

    private LocalDate nextMonday() {
        return LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    }
}

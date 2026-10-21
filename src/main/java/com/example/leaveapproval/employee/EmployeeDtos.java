package com.example.leaveapproval.employee;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class EmployeeDtos {

    private EmployeeDtos() {
    }

    public record EmployeeSummary(
            Long id, String fullName, String email, String department, LocalDate joinDate, Role role) {
        public static EmployeeSummary from(Employee employee) {
            return new EmployeeSummary(employee.getId(), employee.getFullName(), employee.getEmail(),
                    employee.getDepartment(), employee.getJoinDate(), employee.getRole());
        }
    }

    public record EmployeeProfile(
            Long id, String fullName, String email, String department, LocalDate joinDate,
            Role role, int annualLeaveBalance) {
        public static EmployeeProfile from(Employee employee) {
            return new EmployeeProfile(employee.getId(), employee.getFullName(), employee.getEmail(),
                    employee.getDepartment(), employee.getJoinDate(), employee.getRole(),
                    employee.getAnnualLeaveBalance());
        }
    }

    public record AdminEmployee(
            Long id, String fullName, String email, String department, LocalDate joinDate,
            Role role, int annualLeaveBalance, BigDecimal salary) {
        public static AdminEmployee from(Employee employee) {
            return new AdminEmployee(employee.getId(), employee.getFullName(), employee.getEmail(),
                    employee.getDepartment(), employee.getJoinDate(), employee.getRole(),
                    employee.getAnnualLeaveBalance(), employee.getSalary());
        }
    }

    public record LeaveBalance(int annualLeaveBalance, int pendingDays, int availableToRequest) {
    }
}

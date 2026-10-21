package com.example.leaveapproval.auth;

import com.example.leaveapproval.employee.Employee;
import com.example.leaveapproval.employee.EmployeeRepository;
import com.example.leaveapproval.employee.Role;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!prod")
public class DemoDataSeeder {

    @Bean
    ApplicationRunner seedDemoEmployees(EmployeeRepository employees, PasswordEncoder passwordEncoder) {
        return arguments -> {
            addIfMissing(employees, passwordEncoder, "admin@example.com", "Admin123!",
                    "Avery Admin", "Administration", Role.ADMIN, new BigDecimal("120000.00"));
            addIfMissing(employees, passwordEncoder, "manager@example.com", "Manager123!",
                    "Morgan Manager", "Engineering", Role.MANAGER, new BigDecimal("95000.00"));
            addIfMissing(employees, passwordEncoder, "employee@example.com", "Employee123!",
                    "Elliot Employee", "Engineering", Role.EMPLOYEE, new BigDecimal("72000.00"));
            addIfMissing(employees, passwordEncoder, "employee2@example.com", "Employee123!",
                    "Jordan Employee", "People Operations", Role.EMPLOYEE, new BigDecimal("68000.00"));
        };
    }

    private void addIfMissing(EmployeeRepository employees, PasswordEncoder encoder,
                              String email, String password, String fullName, String department,
                              Role role, BigDecimal salary) {
        if (!employees.existsByEmail(email)) {
            employees.save(new Employee(email, encoder.encode(password), fullName, department,
                    LocalDate.of(2020, 1, 15), role, 20, salary));
        }
    }
}

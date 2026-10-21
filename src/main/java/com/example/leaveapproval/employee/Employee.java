package com.example.leaveapproval.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_employees_department", columnList = "department"),
    @Index(name = "idx_employees_join_date", columnList = "join_date")
})
public class Employee implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "annual_leave_balance", nullable = false)
    private int annualLeaveBalance;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    protected Employee() {
    }

    public Employee(String email, String passwordHash, String fullName, String department,
                    LocalDate joinDate, Role role, int annualLeaveBalance, BigDecimal salary) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.department = department;
        this.joinDate = joinDate;
        this.role = role;
        this.annualLeaveBalance = annualLeaveBalance;
        this.salary = salary;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getDepartment() {
        return department;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public Role getRole() {
        return role;
    }

    public int getAnnualLeaveBalance() {
        return annualLeaveBalance;
    }

    public void setAnnualLeaveBalance(int annualLeaveBalance) {
        this.annualLeaveBalance = annualLeaveBalance;
    }

    public BigDecimal getSalary() {
        return salary;
    }
}

package com.example.leaveapproval.employee;

import com.example.leaveapproval.common.BadRequestException;
import com.example.leaveapproval.common.NotFoundException;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.Locale;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Page<Employee> search(String name, String department, LocalDate joinedFrom,
                                 LocalDate joinedTo, Pageable pageable) {
        if (joinedFrom != null && joinedTo != null && joinedFrom.isAfter(joinedTo)) {
            throw new BadRequestException("joinedFrom must be on or before joinedTo");
        }

        Specification<Employee> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (name != null && !name.isBlank()) {
                predicates.add(builder.like(builder.lower(root.get("fullName")),
                        "%" + name.trim().toLowerCase(Locale.ROOT) + "%"));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(builder.equal(builder.lower(root.get("department")),
                        department.trim().toLowerCase(Locale.ROOT)));
            }
            if (joinedFrom != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("joinDate"), joinedFrom));
            }
            if (joinedTo != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("joinDate"), joinedTo));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        return employeeRepository.findAll(specification, pageable);
    }

    public Employee findByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Employee account not found"));
    }
}

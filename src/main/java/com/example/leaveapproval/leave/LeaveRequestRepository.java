package com.example.leaveapproval.leave;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from LeaveRequest l where l.id = :id")
    Optional<LeaveRequest> findByIdForUpdate(@Param("id") Long id);

    Page<LeaveRequest> findAllByEmployee_EmailOrderByStartDateDesc(String email, Pageable pageable);

    Page<LeaveRequest> findAllByStatusOrderByStartDateAsc(LeaveStatus status, Pageable pageable);

    @Query("""
            select l from LeaveRequest l
            where l.status = :status and lower(l.employee.department) = lower(:department)
            order by l.startDate asc
            """)
    Page<LeaveRequest> findByStatusAndEmployeeDepartment(
            @Param("status") LeaveStatus status,
            @Param("department") String department,
            Pageable pageable);

    @Query("""
            select case when count(l) > 0 then true else false end
            from LeaveRequest l
            where l.employee.id = :employeeId
              and l.status in (com.example.leaveapproval.leave.LeaveStatus.PENDING,
                               com.example.leaveapproval.leave.LeaveStatus.APPROVED)
              and l.startDate <= :endDate
              and l.endDate >= :startDate
            """)
    boolean existsOverlappingRequest(
            @Param("employeeId") Long employeeId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);

    @Query("""
            select coalesce(sum(l.daysRequested), 0)
            from LeaveRequest l
            where l.employee.id = :employeeId and l.status = :status
            """)
    long sumDaysByEmployeeAndStatus(
            @Param("employeeId") Long employeeId, @Param("status") LeaveStatus status);
}

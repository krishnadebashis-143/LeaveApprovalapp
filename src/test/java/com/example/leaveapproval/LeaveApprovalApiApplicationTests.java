package com.example.leaveapproval;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class LeaveApprovalApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void onlyAdminsCanSeeSalaryData() throws Exception {
        String employeeToken = login("employee@example.com", "Employee123!");

        mockMvc.perform(get("/api/employees/me")
                        .header("Authorization", bearer(employeeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.salary").doesNotExist());

        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", bearer(employeeToken)))
                .andExpect(status().isForbidden());

        String adminToken = login("admin@example.com", "Admin123!");
        mockMvc.perform(get("/api/admin/employees")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].salary").isNumber());
    }

    @Test
    void employeeCanApplyAndManagerCanApproveWithoutOverlappingLeave() throws Exception {
        String employeeToken = login("employee@example.com", "Employee123!");
        String managerToken = login("manager@example.com", "Manager123!");
        LocalDate start = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(4);
        String requestBody = """
                {"startDate":"%s","endDate":"%s","reason":"Family commitment"}
                """.formatted(start, end);

        MvcResult applyResult = mockMvc.perform(post("/api/leaves")
                        .header("Authorization", bearer(employeeToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.daysRequested").value(5))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        Number leaveIdValue = JsonPath.read(applyResult.getResponse().getContentAsString(), "$.id");
        long leaveId = leaveIdValue.longValue();

        mockMvc.perform(get("/api/leaves/inbox")
                        .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].employeeEmail").value("employee@example.com"));

        mockMvc.perform(post("/api/leaves")
                        .header("Authorization", bearer(employeeToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "This leave overlaps an existing pending or approved request"));

        mockMvc.perform(post("/api/leaves/" + leaveId + "/decision")
                        .header("Authorization", bearer(managerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(get("/api/employees/me/leave-balance")
                        .header("Authorization", bearer(employeeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.annualLeaveBalance").value(15))
                .andExpect(jsonPath("$.availableToRequest").value(15));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}

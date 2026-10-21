package com.example.leaveapproval.leave;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class LeaveDayCounterTest {

    @Test
    void countsWeekdaysInclusively() {
        assertThat(LeaveDayCounter.countWeekdays(
                LocalDate.of(2026, 10, 19), LocalDate.of(2026, 10, 23))).isEqualTo(5);
    }

    @Test
    void excludesWeekendDays() {
        assertThat(LeaveDayCounter.countWeekdays(
                LocalDate.of(2026, 10, 23), LocalDate.of(2026, 10, 26))).isEqualTo(2);
    }

    @Test
    void weekendOnlyRangeHasNoWorkingDays() {
        assertThat(LeaveDayCounter.countWeekdays(
                LocalDate.of(2026, 10, 24), LocalDate.of(2026, 10, 25))).isZero();
    }
}

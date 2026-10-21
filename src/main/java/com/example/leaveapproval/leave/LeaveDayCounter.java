package com.example.leaveapproval.leave;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class LeaveDayCounter {

    private LeaveDayCounter() {
    }

    public static long countWeekdays(LocalDate startDate, LocalDate endDate) {
        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        long fullWeeks = totalDays / 7;
        long weekdays = fullWeeks * 5;
        int remainingDays = (int) (totalDays % 7);
        DayOfWeek day = startDate.getDayOfWeek();
        for (int i = 0; i < remainingDays; i++) {
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                weekdays++;
            }
            day = day.plus(1);
        }
        return weekdays;
    }
}

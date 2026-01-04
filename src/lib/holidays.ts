import { addDays, getYear } from 'date-fns';

export interface Holiday {
    id: string;
    name: string;
    date: Date;
    type: 'holiday';
}

function getNthDayOfWeekInMonth(year: number, month: number, dayOfWeek: number, n: number): Date {
    const firstDayOfMonth = new Date(year, month, 1);
    const day = firstDayOfMonth.getDay();
    let diff = dayOfWeek - day;
    if (diff < 0) diff += 7;
    const date = 1 + diff + (n - 1) * 7;
    return new Date(year, month, date);
}

export function getUpcomingHolidays(daysToCheck: number = 30): Holiday[] {
    const today = new Date();
    const currentYear = getYear(today);
    const nextYear = currentYear + 1;
    const holidays: Holiday[] = [];

    const fixedHolidays = [
        { name: "New Year's Day", month: 0, day: 1 },
        { name: "Valentine's Day", month: 1, day: 14 },
        { name: "Independence Day", month: 6, day: 4 },
        { name: "Christmas Day", month: 11, day: 25 },
        { name: "Halloween", month: 9, day: 31 },
    ];

    // Helper to add fixed holidays for a given year
    const addFixedForYear = (year: number) => {
        fixedHolidays.forEach(h => {
            holidays.push({
                id: `${h.name}-${year}`,
                name: h.name,
                date: new Date(year, h.month, h.day),
                type: 'holiday'
            });
        });
    };

    addFixedForYear(currentYear);
    addFixedForYear(nextYear);

    // Dynamic Holidays
    const addDynamicForYear = (year: number) => {
        // Mother's Day: 2nd Sunday in May (Month 4)
        holidays.push({
            id: `Mothers Day-${year}`,
            name: "Mother's Day",
            date: getNthDayOfWeekInMonth(year, 4, 0, 2),
            type: 'holiday'
        });

        // Father's Day: 3rd Sunday in June (Month 5)
        holidays.push({
            id: `Fathers Day-${year}`,
            name: "Father's Day",
            date: getNthDayOfWeekInMonth(year, 5, 0, 3),
            type: 'holiday'
        });

        // Thanksgiving: 4th Thursday in November (Month 10)
        holidays.push({
            id: `Thanksgiving-${year}`,
            name: "Thanksgiving",
            date: getNthDayOfWeekInMonth(year, 10, 4, 4),
            type: 'holiday'
        });
    };

    addDynamicForYear(currentYear);
    addDynamicForYear(nextYear);

    // Filter for upcoming
    const endDate = addDays(today, daysToCheck);

    return holidays
        .filter(h => {
            // Reset times for accurate comparison
            const hDate = new Date(h.date);
            hDate.setHours(0, 0, 0, 0);
            const tDate = new Date(today);
            tDate.setHours(0, 0, 0, 0);

            return hDate >= tDate && hDate <= endDate;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}

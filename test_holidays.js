const FIXED_HOLIDAYS = [
    { month: 0, day: 1, name: "New Year's Day", icon: "🎉" },
    { month: 1, day: 14, name: "Valentine's Day", icon: "💘" },
    { month: 11, day: 25, name: "Christmas Day", icon: "🎄" },
];

function getUpcomingHolidaysTest(daysAhead) {
    const today = new Date(); // Use current date
    const future = new Date();
    future.setDate(today.getDate() + daysAhead);

    console.log(`Checking from: ${today.toDateString()}`);
    console.log(`Checking until: ${future.toDateString()}`);

    const upcoming = [];
    const currentYear = today.getFullYear();

    // Check this year and next year
    [currentYear, currentYear + 1].forEach(year => {
        FIXED_HOLIDAYS.forEach(holiday => {
            const hDate = new Date(year, holiday.month, holiday.day);
            hDate.setHours(0, 0, 0, 0);

            const todayReset = new Date(today);
            todayReset.setHours(0, 0, 0, 0);

            if (hDate >= todayReset && hDate <= future) {
                const diffTime = Math.abs(hDate - todayReset);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                upcoming.push({
                    name: holiday.name,
                    date: hDate.toDateString(),
                    daysUntil: diffDays
                });
            }
        });
    });

    return upcoming;
}

const results = getUpcomingHolidaysTest(60);
console.log("Found holidays:", JSON.stringify(results, null, 2));

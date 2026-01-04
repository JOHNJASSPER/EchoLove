self.onmessage = function (e) {
    const { reminders } = e.data;

    if (!reminders || reminders.length === 0) return;

    // Check every second
    const checkId = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Find due reminders
        // We check if the reminder time matches current HH:mm AND it hasn't fired yet
        // Since we check every second, we need to be careful not to fire multiple times in that minute
        // Ideally the main thread handles the "has fired" logic, effectively removing it from the active list

        reminders.forEach(reminder => {
            if (reminder.time === currentTime) {
                // Determine if we should fire (simple check: is it the exact minute?)
                // To avoid spamming, the main thread should unsubscribe/update the worker after firing
                self.postMessage({ type: 'FIRE', reminder });
            }
        });
    }, 1000);

    // Store id to clear later if needed (though for now we just let it run)
    // self.intervalId = checkId;
};

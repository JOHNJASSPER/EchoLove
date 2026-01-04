let reminders = [];
let intervalId = null;

self.onmessage = function (e) {
    if (e.data.reminders) {
        reminders = e.data.reminders;
    }

    // Start interval if not running
    if (!intervalId) {
        intervalId = setInterval(() => {
            if (!reminders || reminders.length === 0) return;

            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentSeconds = now.getSeconds();

            // Check if we hit the top of the minute (approx) to avoid firing every second of that minute
            // OR the firing logic needs to trigger once per matching minute.
            // Since the main thread removes the reminder after firing, firing every second until removal is safer
            // to ensure the message gets through, BUT we should debounce slightly.
            // Actually, the previous logic relied on main thread removing it.
            // Let's send it. The main thread will dedup or remove it.

            reminders.forEach(reminder => {
                if (reminder.time === currentTime) {
                    self.postMessage({ type: 'FIRE', reminder });
                }
            });
        }, 1000);
    }
};

import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

export const platform = {
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    isWeb: Capacitor.getPlatform() === 'web',
};

export async function sendSMS(phoneNumber: string, message: string) {
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (isNative) {
        // In the future, we can hook into a native plugin here for background sending
        // For now, we use the intent which is safer and doesn't require dangerous permissions immediately
        // allowing the user to just hit "send" in their default app.
        window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    } else {
        // Web fallback
        window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    }
}

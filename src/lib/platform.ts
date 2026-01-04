import { Capacitor, registerPlugin } from '@capacitor/core';

export interface SmsManagerPlugin {
    send(options: { phoneNumber: string; message: string }): Promise<void>;
}

const SmsManager = registerPlugin<SmsManagerPlugin>('SmsManager');

export const isNative = Capacitor.isNativePlatform();

export const platform = {
    isAndroid: Capacitor.getPlatform() === 'android',
    isIOS: Capacitor.getPlatform() === 'ios',
    isWeb: Capacitor.getPlatform() === 'web',
};

export async function sendSMS(phoneNumber: string, message: string) {
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (isNative) {
        try {
            await SmsManager.send({ phoneNumber: cleanPhone, message });
        } catch (e) {
            console.error('Failed to send native SMS', e);
            // Fallback
            const link = document.createElement('a');
            link.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 100);
            throw e;
        }
    } else {
        // Web fallback
        const link = document.createElement('a');
        link.href = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
    }
}

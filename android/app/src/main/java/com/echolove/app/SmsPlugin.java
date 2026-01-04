package com.echolove.app;

import android.Manifest;
import android.telephony.SmsManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "SmsManager",
    permissions = {
        @Permission(
            alias = "sms",
            strings = { Manifest.permission.SEND_SMS }
        )
    }
)
public class SmsPlugin extends Plugin {

    @PluginMethod
    public void send(PluginCall call) {
        String permissionState = getPermissionState("sms");
        if (permissionState == null || !permissionState.equals(com.getcapacitor.PermissionState.GRANTED)) {
            requestPermissionForAlias("sms", call, "permissionCallback");
            return;
        }

        String phoneNumber = call.getString("phoneNumber");
        String message = call.getString("message");

        if (phoneNumber == null || message == null) {
            call.reject("Must provide phoneNumber and message");
            return;
        }

        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to send SMS: " + e.getMessage());
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        String permissionState = getPermissionState("sms");
        if (permissionState != null && permissionState.equals(com.getcapacitor.PermissionState.GRANTED)) {
            send(call);
        } else {
            call.reject("Permission denied");
        }
    }
}

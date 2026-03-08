# Deep Link Configuration Guide

## ✅ What We've Already Set Up

### 1. **app.json** - Scheme Configuration

```json
"scheme": "kamadhenu",
```

✅ Already configured - allows `kamadhenu://` deep links

### 2. **Auth Layout** - Updated to Allow Deep Links

The auth layout now allows the `reset-password` route even without authentication, which is necessary for the deep link to work when user clicks the email link.

### 3. **Forgot Password** - Sends Correct Deep Link

```tsx
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "kamadhenu://reset-password",
});
```

✅ Configured to redirect to the reset-password screen

---

## 🔧 What Might Still Be Needed

### For **Development (Expo Go)**

When testing on a physical device with Expo Go, deep links might not work. You need to:

**Option 1: Use Expo Development Client**

```bash
# Create development build
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

**Option 2: Test with Expo Go URL Scheme**

- Use: `exp://your-local-ip:8081/--/reset-password?token=xxx`
- Instead of: `kamadhenu://reset-password?token=xxx`

---

### For **Production (EAS Build)**

Add this to `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_USE_FAST_REFRESH": "false"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleTeamId": "YOUR_TEAM_ID",
        "ascAppId": "YOUR_APP_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/key.json"
      }
    }
  }
}
```

For iOS, you also need to configure Associated Domains in Xcode.

---

### For **Android Specific**

Add to `app.json` under `android`:

```json
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        {
          "scheme": "kamadhenu",
          "host": "*"
        }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
}
```

---

### For **iOS Specific**

Add to `app.json` under `ios`:

```json
"ios": {
  "bundleIdentifier": "com.amitbaskey99.milk_app",
  "associatedDomains": [
    "applinks:yourdomain.com"
  ]
}
```

---

## 🧪 How to Test

### Local Testing

1. Make sure your app is running in Expo Go
2. In the email reset link, change `kamadhenu://` to `exp://your-ip:8081/`
3. Example: `exp://192.168.x.x:8081/--/reset-password?token=abc123&type=recovery`

### Testing with EAS Build

1. Build development app: `eas build --platform android --profile preview`
2. Install on device
3. Click the `kamadhenu://` link in the email
4. App should open directly to reset-password screen

---

## 🔗 Complete Flow

```
1. User clicks "Forgot password?"
   ↓
2. forgot-password.tsx sends email with:
   kamadhenu://reset-password?token=xxxxx&type=recovery
   ↓
3. User clicks link in email
   ↓
4. Deep link route handler opens reset-password.tsx
   ↓
5. reset-password.tsx extracts token from URL
   ↓
6. Verifies token with Supabase
   ↓
7. User sets new password
   ↓
8. Auto-redirects to sign-in
```

---

## 🐛 Troubleshooting

### If clicking link doesn't open app:

1. ✅ Confirm `scheme` is set in `app.json`
2. ✅ Confirm auth layout allows reset-password
3. ⚠️ You might need an EAS build (not just Expo Go)
4. ⚠️ Check if Supabase redirect URL matches your app scheme

### If app opens but wrong screen shows:

- Check that `useLocalSearchParams()` is correctly extracting token
- Verify deep link format: `kamadhenu://reset-password?token=...&type=recovery`

### If email doesn't arrive:

- Check Supabase Email Templates are configured
- Check spam folder
- Verify sender email in Supabase Auth settings

---

## ✨ Next Steps

1. **Build the app for testing:**

   ```bash
   eas build --platform android --profile preview
   # Install on device
   ```

2. **Test the complete flow:**
   - Enter email in forgot-password screen
   - Check email for reset link
   - Click link → Should open app to reset-password

3. **If it doesn't work, let me know the error message!**

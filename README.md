# Expo google authentication
In your Expo project, you would handle the login like this:


import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './lib/supabase';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Google Console
});

async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.data?.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });
      
      if (error) throw error;
      console.log("Logged in!", data.user);
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
}

npm i baseline-browser-mapping@latest -D

# deploy to expo
✅ SOLUTION 3 (Nuclear but works)

Recreate git metadata inside container:

rm -rf .git
git init
git config --global protocol.file.allow always
git config --global --add safe.directory /app/reactnative/milk_delivery_app
git add .
git commit -m "Fresh git repo for EAS"


Then:

eas build -p android --profile preview
   
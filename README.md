# Pawprint Android app

Expo / React Native client for the NestJS API. Visitors can browse posts, filter by type, and find posts near their current location. Signed-in users can create lost-pet, sighting, or found-stray posts, add public comments, change their own post's status, and save alert preferences. Sessions are stored using Expo SecureStore.

## Run in development

1. Start MongoDB and the backend as described in `../lost-pets-backend/README.md`. Configure its `.env` and set `OTP_DELIVERY=console` for development.
2. Install Node.js 20.19.4 or newer and run `npm install` in this directory.
3. Start an Android emulator and run `npm run android`, or run `npm start` and open the project with Expo Go on an Android device.
4. The default API address is `http://10.0.2.2:3000/api`, which points to the host from the Android emulator. For a physical device, copy `.env.example` to `.env`, replace `10.0.2.2` with the computer's LAN IP address, and restart Expo. The device must be able to reach the backend (same network, appropriate firewall, and backend listening on the network interface).

`EXPO_PUBLIC_API_URL` is embedded into the client bundle; do not put secrets in it. Android development builds permit HTTP for local testing. Use an HTTPS API and disable `usesCleartextTraffic` in `app.json` for production builds. Location permission is requested only when the user chooses to use their location.

## Current backend limitations

OTP codes are printed to the backend console in development and are not delivered by email or SMS. Posts currently accept public image URLs, not device photo uploads. Coordinates and comments on posts are public. Alert preferences can be saved or removed, but push notifications, automatic background location tracking, and notification matching have not been implemented in the backend or this app.

## Checks

Run `npm run typecheck` for TypeScript validation and `npx expo export --platform android` to verify bundling. Building a native Android app locally requires a supported Android SDK and JDK; Expo's Android tooling currently requires JDK 17.
# lost-pets-app

# Pawprint Android app

Expo / React Native client for the NestJS API. Visitors can browse posts, filter by type, and find posts near their current location. Signed-in users can create lost-pet, sighting, or found-stray posts, add public comments, change their own post's status, and save alert preferences. Sessions are stored using Expo SecureStore.

## Implemented major features

- **Public community feed:** browse and filter lost-pet, sighting, and found-stray posts, load more results, and view post details without an account.
- **Nearby search:** use a one-time foreground location lookup and a chosen radius to find nearby posts. Post locations can be opened in an external map.
- **OTP sign-in:** authenticate through the backend's email OTP flow and store the session with Expo SecureStore. The backend currently prints codes to its development console only.
- **Posts and comments:** create the three post types, view and add public comments, let the post owner reply, and let the owner resolve or reopen a post.
- **My pets:** privately add, view, edit, and remove saved pet profiles.
- **My files:** pick a device file, upload it using a signed GCS URL, confirm it, retry confirmation, and open a signed download link.
- **Alert preferences:** save or remove an alert location, radius, and post types; no notifications are sent yet.

Signed-in users can use **My files** to select files, upload directly to GCS, retry confirmation, and open signed download URLs. Configure the backend GCS bucket first. Files in this private library are not yet attached to pet profiles or public posts.

## Run in development

1. Start MongoDB and the backend as described in `../backend/README.md`. Configure its `.env` and set `OTP_DELIVERY=console` for development.
2. Install Node.js 20.19.4 or newer and run `npm install` in this directory.
3. Start an Android emulator and run `npm run android`, or run `npm start` and open the project with Expo Go on an Android device.
4. The default API address is `http://10.0.2.2:3000/api`, which points to the host from the Android emulator. For a physical device, copy `.env.example` to `.env`, replace `10.0.2.2` with the computer's LAN IP address, and restart Expo. The device must be able to reach the backend (same network, appropriate firewall, and backend listening on the network interface).

`EXPO_PUBLIC_API_URL` is embedded into the client bundle; do not put secrets in it. Android development builds permit HTTP for local testing. Use an HTTPS API and disable `usesCleartextTraffic` in `app.json` for production builds. Location permission is requested only when the user chooses to use their location.

## Current backend limitations

OTP codes are printed to the backend console in development and are not delivered by email or SMS. Posts currently accept public image URLs, not device photo uploads. Coordinates and comments on posts are public. Alert preferences can be saved or removed, but push notifications, automatic background location tracking, and notification matching have not been implemented in the backend or this app.

## Checks

Run `npm run typecheck` for TypeScript validation and `npx expo export --platform android` to verify bundling. Building a native Android app locally requires a supported Android SDK and JDK; Expo's Android tooling currently requires JDK 17.
# lost-pets-app

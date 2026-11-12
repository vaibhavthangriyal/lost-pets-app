import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from './api';

const deviceKey = 'pawprint-device-id';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }) });
async function deviceId() { let value = await SecureStore.getItemAsync(deviceKey); if (!value) { value = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; await SecureStore.setItemAsync(deviceKey, value); } return value; }
export async function registerPushDevice(token: string) {
  if (!Device.isDevice) return;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'Nearby pet posts', importance: Notifications.AndroidImportance.HIGH });
  let permission = await Notifications.getPermissionsAsync(); if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync(); if (permission.status !== 'granted') return;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId; if (!projectId) return;
  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await api('/me/push-devices', { method: 'POST', token, body: { deviceId: await deviceId(), platform: Platform.OS, pushToken } });
}
export async function unregisterPushDevice(token: string) { const value = await SecureStore.getItemAsync(deviceKey); if (value) await api(`/me/push-devices/${encodeURIComponent(value)}`, { method: 'DELETE', token }); }
export function notificationTarget(response: Notifications.NotificationResponse | null) { const data = response?.notification.request.content.data; return typeof data?.postId === 'string' ? { postId: data.postId, notificationId: typeof data.notificationId === 'string' ? data.notificationId : undefined } : null; }

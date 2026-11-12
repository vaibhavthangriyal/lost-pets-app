import { io } from 'socket.io-client';
import { apiOrigin, AppNotification } from './api';

export function connectNotificationSocket(token: string, onNotification: (notification: AppNotification) => void) {
  const socket = io(`${apiOrigin}/notifications`, { auth: { token }, transports: ['websocket', 'polling'], reconnection: true });
  socket.on('notification:new', onNotification);
  return () => { socket.disconnect(); };
}

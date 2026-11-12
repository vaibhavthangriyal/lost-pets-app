import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { api, AppNotification } from '../api';
import { Button, colors, ErrorText, Loading, Note, ScreenModal } from './ui';

export function NotificationsScreen({ token, onClose, onOpenPost }: { token: string; onClose: () => void; onOpenPost: (postId: string, notificationId: string) => void }) {
  const [items, setItems] = useState<AppNotification[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let active = true; api<AppNotification[]>('/me/notifications', { token }).then(data => { if (active) setItems(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  async function readAll() { setError(''); try { await api('/me/notifications/read-all', { method: 'PATCH', token }); setItems(previous => previous.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); } catch (err) { setError((err as Error).message); } }
  return <ScreenModal visible title="Notifications" subtitle="Nearby posts matching your locations." onClose={onClose}><ErrorText message={error}/>{loading ? <Loading/> : !items.length ? <Note>No notifications yet.</Note> : <><Button title="Mark all as read" onPress={readAll} secondary/>{items.map(item => <Pressable accessibilityRole="button" key={item._id} onPress={() => onOpenPost(item.post, item._id)} style={{ borderWidth: 1, borderColor: item.readAt ? colors.border : '#b9d6b7', backgroundColor: item.readAt ? '#fff' : '#f1f7ed', borderRadius: 9, padding: 14, gap: 6 }}><Text style={{ color: colors.ink, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: colors.muted, lineHeight: 19 }}>{item.body}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{new Date(item.createdAt).toLocaleString()}</Text></Pressable>)}</>}</ScreenModal>;
}

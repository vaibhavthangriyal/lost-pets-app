import * as Location from 'expo-location';

export type PostType = 'lost' | 'sighting' | 'rescue';
export type Coordinates = { latitude: number; longitude: number };
export type User = { id: string; displayName: string; email?: string };
export type OwnedPet = { _id: string; name: string; species: string; breed: string; description: string; photos: string[] };
export type Session = { token: string; user: User };
export type PetPost = { _id: string; type: PostType; title: string; description: string; species?: string; breed?: string; photos: string[]; location: { coordinates: [number, number] }; occurredAt: string; createdAt: string; status: 'active' | 'resolved'; author: { _id: string; displayName: string } | null; relatedPost?: string };
export type MetaOption = { value: string; label: string };
export type Metadata = { petTypes: MetaOption[]; postTypes: MetaOption[]; breeds: (MetaOption & { petType?: string })[]; currencies: MetaOption[] };
export type Comment = { _id: string; text: string; author: { _id: string; displayName: string } | null; createdAt: string; replies?: Comment[] };
export type NotificationLocation = { _id: string; name: string; location: { coordinates: [number, number] }; radiusKm: number; types: PostType[]; active: boolean };
export type AppNotification = { _id: string; post: string; title: string; body: string; readAt?: string; openedAt?: string; createdAt: string };
export type EligiblePosterPost = Pick<PetPost, 'title' | 'description' | 'species' | 'breed' | 'photos' | 'location' | 'occurredAt' | 'status'> & { _id: string };
export type PosterData = { _id: string; postId: string; heading: string; title: string; description: string; mobileNumber?: string; rewardAmount?: number; currency?: string; species?: string; breed?: string; photo?: string; location: { coordinates: [number, number] }; occurredAt: string; status: string; createdAt: string };
export const types: PostType[] = ['lost', 'sighting', 'rescue'];
export const labels: Record<PostType, string> = { lost: 'Lost pet', sighting: 'Sighting', rescue: 'Found stray' };
const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api').replace(/\/$/, '');
export const apiOrigin = baseUrl.replace(/\/api$/, '');
export function mediaUrl(url: string) { return url.startsWith('/') ? `${baseUrl.replace(/\/api$/, '')}${url}` : url; }

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { method: options.method || 'GET', headers: { Accept: 'application/json', ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }, ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}) });
  } catch { throw new Error('Could not reach the server. Check the backend address and your connection.'); }
  const result = await response.json().catch(() => null);
  if (!response.ok) { const message = result?.message; throw new Error(Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : 'Something went wrong. Please try again.'); }
  return result as T;
}
export async function currentLocation(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Location permission was denied. You can enter coordinates instead.');
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}
export function parseCoordinates(latitude: string, longitude: string): Coordinates {
  if (!latitude.trim() || !longitude.trim()) throw new Error('Enter both latitude and longitude.');
  const lat = Number(latitude); const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error('Enter valid latitude (-90 to 90) and longitude (-180 to 180).');
  return { latitude: lat, longitude: lng };
}

import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { api, labels, parseCoordinates, PostType, types } from '../api';
import { LocationFields } from './location-fields';
import { Button, Chip, ErrorText, Field, Note, ScreenModal } from './ui';

export function PostForm({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<PostType>('lost'); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [species, setSpecies] = useState(''); const [photos, setPhotos] = useState(''); const [relatedPostId, setRelatedPostId] = useState(''); const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16) + 'Z');
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit() {
    setError(''); setBusy(true);
    try {
      const location = parseCoordinates(latitude, longitude);
      if (!title.trim() || !description.trim()) throw new Error('Please add a title and description.');
      const date = new Date(occurredAt);
      if (!Number.isFinite(date.getTime())) throw new Error('Enter a valid date and time in ISO format.');
      const imageUrls = photos.split('\n').map(s => s.trim()).filter(Boolean);
      if (imageUrls.length > 10) throw new Error('You can add up to 10 photo URLs.');
      await api('/posts', { method: 'POST', token, body: { type, title: title.trim(), description: description.trim(), ...(species.trim() ? { species: species.trim() } : {}), photos: imageUrls, location, occurredAt: date.toISOString(), ...(type === 'sighting' && relatedPostId.trim() ? { relatedPostId: relatedPostId.trim() } : {}) } });
      onCreated();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <ScreenModal visible title="Create a post" subtitle="A little detail can make a big difference." onClose={onClose}>
    <ErrorText message={error}/><Note>Choose a post type</Note><ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={{ flexDirection: 'row' }}>{types.map(item => <Chip key={item} label={labels[item]} active={type === item} onPress={() => setType(item)}/>)}</View></ScrollView>
    <Field label="Title" value={title} onChangeText={setTitle} maxLength={120} placeholder="Give your post a clear title"/><Field label="Description" value={description} onChangeText={setDescription} maxLength={5000} multiline placeholder="Share identifying details and anything else that could help."/><Field label="Animal type (optional)" value={species} onChangeText={setSpecies} maxLength={80} placeholder="e.g. Dog"/><Field label="When did it happen? (UTC)" value={occurredAt} onChangeText={setOccurredAt} autoCapitalize="none" placeholder="2026-11-08T10:00Z"/><Note>Use ISO format, for example 2026-11-08T10:00Z. The pre-filled value is the current time in UTC.</Note>
    <LocationFields {...{ latitude, longitude, setLatitude, setLongitude }}/><Note>The location you submit is visible to everyone.</Note><Field label="Photo URLs (optional)" value={photos} onChangeText={setPhotos} autoCapitalize="none" multiline placeholder="https://example.com/photo.jpg"/><Note>Enter one public image URL per line, up to 10. Direct uploads are not available yet.</Note>{type === 'sighting' && <Field label="Related lost post ID (optional)" value={relatedPostId} onChangeText={setRelatedPostId} autoCapitalize="none" placeholder="Paste the lost post ID"/>}
    <Button title={busy ? 'Publishing...' : 'Publish post'} onPress={submit} disabled={busy}/>
  </ScreenModal>;
}

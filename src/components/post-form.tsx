import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useState } from 'react';
import { api, Metadata, parseCoordinates, PostType } from '../api';
import { LocationFields } from './location-fields';
import { Button, ErrorText, Field, Note, ScreenModal, Select } from './ui';

export function PostForm({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<PostType>('lost'); const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [species, setSpecies] = useState(''); const [breed, setBreed] = useState(''); const [photos, setPhotos] = useState<DocumentPicker.DocumentPickerAsset[]>([]); const [relatedPostId, setRelatedPostId] = useState(''); const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16) + 'Z');
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<Metadata>({ petTypes: [], postTypes: [], breeds: [], currencies: [] });
  useEffect(() => { let active = true; api<Metadata>('/meta').then(data => { if (active) setMetadata(data); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, []);
  async function pickPhotos() {
    setError('');
    try { const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', multiple: true, copyToCacheDirectory: true }); if (!result.canceled) { if (result.assets.length > 10) throw new Error('You can add up to 10 photos.'); setPhotos(result.assets); } }
    catch (err) { setError((err as Error).message || 'Could not select photos.'); }
  }
  async function submit() {
    setError(''); setBusy(true);
    try {
      const location = parseCoordinates(latitude, longitude);
      if (!title.trim() || !description.trim()) throw new Error('Please add a title and description.');
      const date = new Date(occurredAt);
      if (!Number.isFinite(date.getTime())) throw new Error('Enter a valid date and time in ISO format.');
      const photoFileIds: string[] = [];
      for (const photo of photos) {
        const body = new File(photo.uri); const size = photo.size ?? body.size; const mimeType = photo.mimeType || body.type;
        if (!size || size > 104857600) throw new Error(`${photo.name} must be non-empty and no larger than 100 MiB.`);
        if (!mimeType?.startsWith('image/')) throw new Error(`${photo.name} is not an image.`);
        const request = await api<{ file: { id: string }; upload: { url: string; method: string; headers: Record<string, string> } }>('/files/upload-url', { method: 'POST', token, body: { filename: photo.name, mimeType, size } });
        const response = await expoFetch(request.upload.url, { method: request.upload.method, headers: request.upload.headers, body });
        if (!response.ok) throw new Error(`Could not upload ${photo.name} (HTTP ${response.status}).`);
        await api(`/files/${request.file.id}/confirm`, { method: 'POST', token });
        photoFileIds.push(request.file.id);
      }
      await api('/posts', { method: 'POST', token, body: { type, title: title.trim(), description: description.trim(), ...(species ? { species } : {}), ...(breed ? { breed } : {}), photoFileIds, location, occurredAt: date.toISOString(), ...(type === 'sighting' && relatedPostId.trim() ? { relatedPostId: relatedPostId.trim() } : {}) } });
      onCreated();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <ScreenModal visible title="Create a post" subtitle="A little detail can make a big difference." onClose={onClose}>
    <ErrorText message={error}/><Select label="Post type" value={type} options={metadata.postTypes} placeholder="Select post type" onChange={value => setType(value as PostType)}/>
    <Field label="Title" value={title} onChangeText={setTitle} maxLength={120} placeholder="Give your post a clear title"/><Field label="Description" value={description} onChangeText={setDescription} maxLength={5000} multiline placeholder="Share identifying details and anything else that could help."/><Select label="Animal type (optional)" value={species} options={[{ value: '', label: 'No animal type' }, ...metadata.petTypes]} placeholder="Select animal type" onChange={value => { setSpecies(value); setBreed(''); }}/><Select label="Breed (optional)" value={breed} options={[{ value: '', label: 'No breed' }, ...metadata.breeds.filter(option => option.petType === species)]} placeholder={species ? 'Select breed' : 'Select animal type first'} onChange={setBreed} disabled={!species || !metadata.breeds.some(option => option.petType === species)}/><Field label="When did it happen? (UTC)" value={occurredAt} onChangeText={setOccurredAt} autoCapitalize="none" placeholder="2026-11-08T10:00Z"/><Note>Use ISO format, for example 2026-11-08T10:00Z. The pre-filled value is the current time in UTC.</Note>
    <LocationFields {...{ latitude, longitude, setLatitude, setLongitude }}/><Note>The location you submit is visible to everyone.</Note><Button title={photos.length ? `${photos.length} photo${photos.length === 1 ? '' : 's'} selected` : 'Choose photos (optional)'} onPress={pickPhotos} disabled={busy} secondary/><Note>Choose up to 10 images. They will be uploaded when you publish the post.</Note>{type === 'sighting' && <Field label="Related lost post ID (optional)" value={relatedPostId} onChangeText={setRelatedPostId} autoCapitalize="none" placeholder="Paste the lost post ID"/>}
    <Button title={busy ? 'Publishing...' : 'Publish post'} onPress={submit} disabled={busy}/>
  </ScreenModal>;
}

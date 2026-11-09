import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { api } from '../api';
import { Button, colors, ErrorText, Loading, Note, ScreenModal } from './ui';

type FileRecord = { id: string; filename: string; size: number; mimeType: string; status: 'pending' | 'uploaded' | 'failed' };
type UploadRequest = { file: FileRecord; upload: { url: string; method: string; headers: Record<string, string> } };
export function MyFilesScreen({ token, onClose }: { token: string; onClose: () => void }) {
  const [files, setFiles] = useState<FileRecord[]>([]); const [selected, setSelected] = useState<DocumentPicker.DocumentPickerAsset | null>(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => { let active = true; api<FileRecord[]>('/files', { token }).then(data => { if (active) setFiles(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  function update(file: FileRecord) { setFiles(prev => [file, ...prev.filter(item => item.id !== file.id)]); }
  async function pick() { setError(''); try { const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true }); if (!result.canceled) setSelected(result.assets[0]); } catch (err) { setError((err as Error).message || 'Could not select the file.'); } }
  async function confirm(id: string) { const file = await api<FileRecord>(`/files/${id}/confirm`, { method: 'POST', token }); update(file); }
  async function upload() { if (!selected) return; setBusy(true); setError(''); setNotice(''); try {
    const body = new File(selected.uri); const size = selected.size ?? body.size;
    if (!size || size > 104857600) throw new Error('Choose a non-empty file no larger than 100 MiB.');
    const request = await api<UploadRequest>('/files/upload-url', { method: 'POST', token, body: { filename: selected.name, mimeType: selected.mimeType || 'application/octet-stream', size } });
    update(request.file);
    const response = await expoFetch(request.upload.url, { method: request.upload.method, headers: request.upload.headers, body });
    if (!response.ok) throw new Error(`Upload failed (HTTP ${response.status}).`);
    await confirm(request.file.id); setSelected(null); setNotice('File uploaded and confirmed.');
  } catch (err) { setError((err as Error).message || 'Upload failed.'); } finally { setBusy(false); } }
  async function retry(id: string) { setBusy(true); setError(''); setNotice(''); try { await confirm(id); setNotice('Upload confirmed.'); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } }
  async function download(id: string) { setBusy(true); setError(''); try { const result = await api<{ download: { url: string } }>(`/files/${id}/download-url`, { token }); await Linking.openURL(result.download.url); } catch (err) { setError((err as Error).message || 'Could not open download.'); } finally { setBusy(false); } }
  return <ScreenModal visible title="My files" subtitle="Upload and access your private files." onClose={onClose}><ErrorText message={error}/>{!!notice && <Note>{notice}</Note>}<Button title={selected ? `Selected: ${selected.name}` : 'Choose a file'} onPress={pick} disabled={busy} secondary/><Note>Any file type, up to 100 MiB. Files are private to your account. Duration is not detected automatically.</Note><Button title={busy ? 'Working...' : 'Upload file'} onPress={upload} disabled={busy || !selected}/>{loading ? <Loading/> : <><Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>Recent files</Text>{!files.length && <Note>No files uploaded yet.</Note>}{files.map(file => <View key={file.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 14, gap: 8 }}><Text style={{ color: colors.ink, fontWeight: '700' }}>{file.filename}</Text><Note>{file.mimeType} · {(file.size / 1048576).toFixed(2)} MiB · {file.status}</Note>{file.status === 'uploaded' ? <Button title="Download" onPress={() => download(file.id)} disabled={busy} secondary/> : file.status === 'pending' ? <Button title="Retry confirmation" onPress={() => retry(file.id)} disabled={busy} secondary/> : null}</View>)}<Note>Showing up to 100 recent files. Pending uploads can be confirmed if upload completed but confirmation failed.</Note></>}</ScreenModal>;
}

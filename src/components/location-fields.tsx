import React, { useState } from 'react';
import { View } from 'react-native';
import { currentLocation } from '../api';
import { Button, ErrorText, Field } from './ui';

export function LocationFields({ latitude, longitude, setLatitude, setLongitude }: { latitude: string; longitude: string; setLatitude: (value: string) => void; setLongitude: (value: string) => void }) {
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function locate() { setLoading(true); setError(''); try { const point = await currentLocation(); setLatitude(String(point.latitude)); setLongitude(String(point.longitude)); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } }
  return <View style={{ gap: 12 }}><Field label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" placeholder="e.g. 40.7128"/><Field label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" placeholder="e.g. -74.006"/><ErrorText message={error}/><Button title={loading ? 'Getting location...' : 'Use my current location'} onPress={locate} disabled={loading} secondary icon="crosshairs-gps"/></View>;
}

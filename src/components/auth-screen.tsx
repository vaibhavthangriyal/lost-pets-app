import React, { useState } from 'react';
import { api, User } from '../api';
import { Button, ErrorText, Field, Note, ScreenModal } from './ui';

export function AuthScreen({ visible, onClose, onSignedIn }: { visible: boolean; onClose: () => void; onSignedIn: (token: string, user: User) => Promise<void> }) {
  const [mode, setMode] = useState<'email' | 'sms'>('email'); const [email, setEmail] = useState(''); const [phoneNumber, setPhoneNumber] = useState(''); const [name, setName] = useState(''); const [code, setCode] = useState(''); const [step, setStep] = useState<'email' | 'code'>('email'); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  function close() { setStep('email'); setError(''); setCode(''); onClose(); }
  async function submit() {
    setError(''); setBusy(true);
    try {
      const identity = mode === 'email' ? { email: email.trim() } : { phoneNumber: phoneNumber.trim(), ...(email.trim() ? { email: email.trim() } : {}) };
      if (step === 'email') { const result = await api<{ channel: 'email' | 'sms' }>('/auth/otp/request', { method: 'POST', body: { channel: mode, ...identity } }); setMode(result.channel); setStep('code'); }
      else { const result = await api<{ accessToken: string; user: User }>('/auth/otp/verify', { method: 'POST', body: { channel: mode, ...identity, code, displayName: name.trim() } }); await onSignedIn(result.accessToken, result.user); setStep('email'); setCode(''); }
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <ScreenModal visible={visible} title={step === 'email' ? 'Welcome to LostPetFinder' : 'Enter your code'} subtitle={step === 'email' ? 'Join your local pet-finding community.' : `Enter the six-digit code sent to ${mode === 'email' ? email : phoneNumber}.`} onClose={close}>
    <ErrorText message={error}/>{step === 'email' ? <>{mode === 'email' ? <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com"/> : <><Field label="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" autoCapitalize="none" placeholder="+14155552671"/><Field label="Fallback email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com"/></>}<Button title={mode === 'email' ? 'Use SMS instead' : 'Use email instead'} onPress={() => { setMode(mode === 'email' ? 'sms' : 'email'); setError(''); }} secondary/></> : <><Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="000000"/><Field label="Display name" value={name} onChangeText={setName} maxLength={80} placeholder="How should we call you?"/><Button title="Change contact or request another code" onPress={() => { setStep('email'); setError(''); }} secondary/></>}
    <Button title={busy ? 'Please wait...' : step === 'email' ? 'Send verification code' : 'Sign in'} onPress={submit} disabled={busy || (step === 'email' ? (mode === 'email' ? !email.trim() : !phoneNumber.trim()) : code.length !== 6 || !name.trim())}/><Note>Your contact details are not public. Phone numbers must use international E.164 format.</Note>
  </ScreenModal>;
}

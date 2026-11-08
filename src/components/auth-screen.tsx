import React, { useState } from 'react';
import { api, User } from '../api';
import { Button, ErrorText, Field, Note, ScreenModal } from './ui';

export function AuthScreen({ visible, onClose, onSignedIn }: { visible: boolean; onClose: () => void; onSignedIn: (token: string, user: User) => Promise<void> }) {
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [code, setCode] = useState(''); const [step, setStep] = useState<'email' | 'code'>('email'); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  function close() { setStep('email'); setError(''); setCode(''); onClose(); }
  async function submit() {
    setError(''); setBusy(true);
    try {
      if (step === 'email') { await api('/auth/otp/request', { method: 'POST', body: { email: email.trim() } }); setStep('code'); }
      else { const result = await api<{ accessToken: string; user: User }>('/auth/otp/verify', { method: 'POST', body: { email: email.trim(), code, displayName: name.trim() } }); await onSignedIn(result.accessToken, result.user); setStep('email'); setCode(''); }
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return <ScreenModal visible={visible} title={step === 'email' ? 'Welcome to Pawprint' : 'Enter your code'} subtitle={step === 'email' ? 'Sign in to help pets find their way home.' : `Enter the six-digit code for ${email}.`} onClose={close}>
    <ErrorText message={error}/>{step === 'email' ? <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com"/> : <><Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="000000"/><Field label="Display name" value={name} onChangeText={setName} maxLength={80} placeholder="How should we call you?"/><Button title="Change email or request another code" onPress={() => { setStep('email'); setError(''); }} secondary/></>}
    <Button title={busy ? 'Please wait...' : step === 'email' ? 'Send verification code' : 'Sign in'} onPress={submit} disabled={busy || (step === 'email' ? !email.trim() : code.length !== 6 || !name.trim())}/><Note>Your email is not public. Development codes are printed in the backend console; real OTP delivery is not configured yet.</Note>
  </ScreenModal>;
}

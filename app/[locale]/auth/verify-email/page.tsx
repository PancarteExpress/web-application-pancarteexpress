import { Suspense } from 'react';
import VerifyEmailClient from './verifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
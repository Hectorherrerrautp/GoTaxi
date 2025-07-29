// app/confirm/page.tsx  (⚠️ sin 'use client')
import { Suspense } from 'react';
import ConfirmForm from './ConfirmForm'; // (cliente)

export default function ConfirmPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? '';

  return (
    <Suspense fallback={<div className="text-white p-6">Cargando…</div>}>
      <ConfirmForm email={email} />
    </Suspense>
  );
}

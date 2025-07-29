// app/confirm/page.tsx
import { Suspense } from 'react';
import ConfirmForm from './ConfirmForm';

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function ConfirmPage({ searchParams }: Props) {
  // ── Normalizamos: si viene como array, tomamos el primer elemento
  const raw      = searchParams?.email;
  const email    = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';

  return (
    <Suspense fallback={<div className="text-white p-6">Cargando…</div>}>
      <ConfirmForm email={email} />
    </Suspense>
  );
}

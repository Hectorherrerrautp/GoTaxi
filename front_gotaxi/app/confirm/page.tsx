// app/confirm/page.tsx  (Server Component, async)
import ConfirmForm from './ConfirmForm'; // cliente

// No necesitamos Suspense: el page ya es async y no hay CSR-bailout
export default async function ConfirmPage({
  searchParams,
}: {
  /* igualamos el tipo real de Next */
  searchParams?: Promise<Record<string, unknown>>;
}) {
  // Next nos pasa un Promise; lo resolvemos
  const params = searchParams ? await searchParams : {};

  // Extraemos y normalizamos `email`
  const raw   = params?.email as string | string[] | undefined;
  const email = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';

  return <ConfirmForm email={email} />;
}

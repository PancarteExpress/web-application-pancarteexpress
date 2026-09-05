'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h1>Erreur</h1>
        <button onClick={() => reset()}>Réessayer</button>
      </body>
    </html>
  );
}
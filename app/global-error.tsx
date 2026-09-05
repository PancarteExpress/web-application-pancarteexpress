'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Erreur</h1>
        <p>Une erreur s'est produite.</p>
        <button onClick={() => reset()}>Réessayer</button>
      </body>
    </html>
  );
}
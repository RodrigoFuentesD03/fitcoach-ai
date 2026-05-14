'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-zinc-400 text-sm mb-8">
          An unexpected error occurred. Please try again — if it keeps happening, reload the page.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <p className="text-5xl font-black text-zinc-700 mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-zinc-400 text-sm mb-8">
          This page doesn&apos;t exist. Maybe it moved, or you followed an old link.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

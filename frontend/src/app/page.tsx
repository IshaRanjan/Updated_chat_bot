export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[var(--ms-navy)]">
        MoodScale
      </p>
      <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
        FAQ Navigator Demo
      </h1>
      <p className="max-w-xl text-slate-600">
        This page demonstrates the floating MoodScale Assistant widget. Click the
        chat bubble in the bottom-right corner to browse categories,
        subcategories, and questions — all powered by Supabase.
      </p>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-left text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-800">How it works</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>No text input — click-only navigation</li>
          <li>Unlimited category nesting from Supabase</li>
          <li>Back button with history stack</li>
          <li>Redirect buttons on answers</li>
        </ul>
      </div>
    </main>
  );
}

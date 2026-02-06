import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-16 md:px-10">
      <header className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Private Connect
        </p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
          Private access made simple
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Link your devices, send files privately, and access your local apps anywhere.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Link your devices",
            description: "Keep your personal and work machines in one place."
          },
          {
            title: "Send files privately",
            description: "Share directly between devices without extra steps."
          },
          {
            title: "Access local apps anywhere",
            description: "Open what you need, even when you are away."
          }
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

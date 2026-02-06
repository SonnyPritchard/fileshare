"use client";

import { useState } from "react";

const pairingCode = "PC-123-ABC";

export default function AddDevicePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Add device
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Link a new device
        </h1>
        <p className="text-sm text-slate-600">
          Open Private Connect on the device you want to link, then enter the
          pairing code below.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Pairing code</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-2xl font-semibold tracking-[0.2em] text-slate-900">
            {pairingCode}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {copied ? "Copied" : "Copy to clipboard"}
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Keep this code private. It expires when you finish linking the device.
        </p>
      </section>
    </main>
  );
}

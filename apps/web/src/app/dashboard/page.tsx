import Link from "next/link";
import { getDevices } from "../../../lib/api";

export default async function DashboardPage() {
  const devices = await getDevices();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Your devices</h1>
        <p className="text-sm text-slate-600">
          Keep track of the devices linked to your space.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Devices</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/devices/add"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add device
            </Link>
            <button
              type="button"
              disabled
              aria-label="Send file"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400"
            >
              Coming soon
            </button>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-100">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{device.name}</p>
                <p className="text-xs text-slate-500">Status</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  device.status === "Connected"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {device.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

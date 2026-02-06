"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { completeDevicePairing, startDevicePairing } from "../../../lib/api";

type PairingStatus = "idle" | "loading" | "success" | "error";

export default function AddDevicePage() {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingExpiresAt, setPairingExpiresAt] = useState<string | null>(null);
  const [startStatus, setStartStatus] = useState<PairingStatus>("idle");
  const [startError, setStartError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [codeInput, setCodeInput] = useState("");
  const [completeStatus, setCompleteStatus] = useState<PairingStatus>("idle");
  const [completeError, setCompleteError] = useState("");

  const formattedExpiry = useMemo(() => {
    if (!pairingExpiresAt) return null;
    const date = new Date(pairingExpiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [pairingExpiresAt]);

  const startPairing = async () => {
    try {
      setStartStatus("loading");
      setStartError("");
      const response = await startDevicePairing("New device");
      setPairingCode(response.pairingCode);
      setPairingExpiresAt(null);
      setStartStatus("success");
    } catch (error) {
      setStartStatus("error");
      setStartError("Unable to generate a pairing code. Try again.");
    }
  };

  const handleCopy = async () => {
    if (!pairingCode) return;
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleComplete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeInput.trim()) {
      setCompleteStatus("error");
      setCompleteError("Enter the 6-digit code.");
      return;
    }
    try {
      setCompleteStatus("loading");
      setCompleteError("");
      await completeDevicePairing(codeInput.trim());
      setCompleteStatus("success");
      setCodeInput("");
    } catch (error) {
      setCompleteStatus("error");
      if (error instanceof Error) {
        setCompleteError(error.message);
      } else {
        setCompleteError("Unable to link this device.");
      }
    }
  };

  useEffect(() => {
    startPairing();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Add device
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Link a new device</h1>
        <p className="text-sm text-slate-600">
          Use the same account on both devices. On Device A, grab the code. On Device B, enter it to
          link this device.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Device A</h2>
            <button
              type="button"
              onClick={startPairing}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              New code
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">Show this code on the device you already use.</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-2xl font-semibold tracking-[0.2em] text-slate-900">
              {pairingCode ?? "------"}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!pairingCode}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
          {formattedExpiry ? (
            <p className="mt-3 text-sm text-slate-500">
              Code expires at {formattedExpiry}. Keep it private.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Code expires after 10 minutes.</p>
          )}
          {startStatus === "error" ? (
            <p className="mt-3 text-sm font-medium text-rose-600">{startError}</p>
          ) : null}
          {startStatus === "loading" ? (
            <p className="mt-3 text-sm text-slate-500">Generating code…</p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Device B</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the 6-digit code to link this device to your space.
          </p>
          <form onSubmit={handleComplete} className="mt-4 flex flex-col gap-4">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={codeInput}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 6);
                setCodeInput(value);
                if (completeStatus !== "idle") {
                  setCompleteStatus("idle");
                  setCompleteError("");
                }
              }}
              placeholder="Enter code"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-semibold tracking-[0.3em] text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={completeStatus === "loading"}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {completeStatus === "loading" ? "Linking..." : "Link this device"}
            </button>
          </form>
          {completeStatus === "success" ? (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              Device linked. You can return to your dashboard.
            </p>
          ) : null}
          {completeStatus === "error" ? (
            <p className="mt-3 text-sm font-medium text-rose-600">{completeError}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

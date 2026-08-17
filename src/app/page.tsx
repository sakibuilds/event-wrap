"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  WrapInput,
  emptyInput,
  splitLines,
  buildAll,
  allAsText,
} from "@/lib/templates";

const STORAGE_KEY = "eventwrap-draft-v1";

function loadDraft(): WrapInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WrapInput>;
      return { ...emptyInput, ...parsed };
    }
  } catch {
    // ignore corrupt drafts
  }
  return emptyInput;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" className="btn-ghost" onClick={onCopy}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[13px] font-semibold">
        {label}
        {hint && <span className="ml-2 font-normal text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";

export default function Page() {
  const [form, setForm] = useState<WrapInput>(emptyInput);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setForm(loadDraft());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch {
        // storage full or blocked — ignore
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [form, loaded]);

  const set = <K extends keyof WrapInput>(key: K, value: WrapInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const blocks = useMemo(() => buildAll(form), [form]);
  const joined = useMemo(() => allAsText(form), [form]);

  const downloadAll = () => {
    const blob = new Blob([joined], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.eventName.trim().toLowerCase().replace(/\s+/g, "-") || "event"}-wrap.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setForm(emptyInput);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Event Wrap
        </h1>
        <p className="mt-1 text-sm text-muted">
          One event brief in, copy-ready thank-yous, recaps, partner notes, team
          wrap, and a social post out.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Left: inputs */}
        <section className="space-y-5">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
              Event brief
            </h2>
            <div className="space-y-4">
              <Field label="Event name">
                <input
                  className={inputCls}
                  value={form.eventName}
                  onChange={(e) => set("eventName", e.target.value)}
                  placeholder="Event 1"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    className={inputCls}
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                    placeholder="18 Aug 2026"
                  />
                </Field>
                <Field label="Format">
                  <select
                    className={inputCls}
                    value={form.format}
                    onChange={(e) =>
                      set("format", e.target.value as WrapInput["format"])
                    }
                  >
                    <option value="live">Live</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </Field>
              </div>
              <Field label="Numbers" hint="e.g. 120 attendees, 6 speakers">
                <input
                  className={inputCls}
                  value={form.numbers}
                  onChange={(e) => set("numbers", e.target.value)}
                  placeholder="—"
                />
              </Field>
              <Field label="Highlights" hint="one per line">
                <textarea
                  className={inputCls}
                  rows={3}
                  value={form.highlights.join("\n")}
                  onChange={(e) => set("highlights", splitLines(e.target.value))}
                  placeholder={"A moment that stood out\nA question that opened the room"}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
              People
            </h2>
            <div className="space-y-4">
              <Field label="Speakers" hint="one per line">
                <textarea
                  className={inputCls}
                  rows={3}
                  value={form.speakers.join("\n")}
                  onChange={(e) => set("speakers", splitLines(e.target.value))}
                  placeholder={"Speaker 1\nSpeaker 2"}
                />
              </Field>
              <Field label="Partners / sponsors" hint="one per line">
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.partners.join("\n")}
                  onChange={(e) => set("partners", splitLines(e.target.value))}
                  placeholder={"Partner 1"}
                />
              </Field>
              <Field label="Sign-off name">
                <input
                  className={inputCls}
                  value={form.signoff}
                  onChange={(e) => set("signoff", e.target.value)}
                  placeholder="[Your name]"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
              Links
            </h2>
            <div className="space-y-4">
              {(
                [
                  ["recordingUrl", "Recording"],
                  ["slidesUrl", "Slides"],
                  ["photosUrl", "Photos"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    className={inputCls}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder="https://"
                  />
                </Field>
              ))}
              <Field label="Feedback form">
                <input
                  className={inputCls}
                  value={form.feedbackUrl}
                  onChange={(e) => set("feedbackUrl", e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Next event name">
                  <input
                    className={inputCls}
                    value={form.nextEventName}
                    onChange={(e) => set("nextEventName", e.target.value)}
                    placeholder="Event 2"
                  />
                </Field>
                <Field label="Next event link">
                  <input
                    className={inputCls}
                    value={form.nextEventUrl}
                    onChange={(e) => set("nextEventUrl", e.target.value)}
                    placeholder="https://"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-sm">
            <Field label="Tone">
              <select
                className={inputCls + " w-40"}
                value={form.tone}
                onChange={(e) => set("tone", e.target.value as WrapInput["tone"])}
              >
                <option value="warm">Warm</option>
                <option value="professional">Professional</option>
                <option value="crisp">Crisp</option>
              </select>
            </Field>
            <button type="button" className="btn-ghost" onClick={reset}>
              Reset draft
            </button>
          </div>
        </section>

        {/* Right: outputs */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {blocks.length > 0
                ? `${blocks.length} blocks ready to copy.`
                : "Start filling the brief — blocks appear here as you type."}
            </p>
            {blocks.length > 0 && (
              <div className="flex gap-2">
                <CopyButton text={joined} label="Copy all" />
                <button type="button" className="btn-primary" onClick={downloadAll}>
                  Download .txt
                </button>
              </div>
            )}
          </div>

          {blocks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">
              Filled-in fields generate: a speaker thank-you, attendee recap,
              partner note, internal team recap, and a social post — each
              copy-ready.
            </div>
          )}

          {blocks.map((b) => (
            <article
              key={b.key}
              className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line bg-soft px-4 py-3">
                <h3 className="text-sm font-bold">{b.label}</h3>
                <CopyButton text={b.subject ? `Subject: ${b.subject}\n\n${b.text}` : b.text} label="Copy" />
              </div>
              <div className="px-4 py-3">
                {b.subject && (
                  <div className="mb-2 rounded-lg bg-[var(--bg)] px-3 py-2 text-[13px]">
                    <span className="font-semibold text-muted">Subject: </span>
                    {b.subject}
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                  {b.text}
                </pre>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
export type EventFormat = "live" | "online" | "hybrid";
export type Tone = "warm" | "professional" | "crisp";

export interface WrapInput {
  eventName: string;
  eventDate: string;
  format: EventFormat;
  hostNames: string;
  speakers: string[];
  partners: string[];
  recordingUrl: string;
  slidesUrl: string;
  photosUrl: string;
  feedbackUrl: string;
  nextEventName: string;
  nextEventUrl: string;
  highlights: string[];
  numbers: string;
  tone: Tone;
  signoff: string;
}

export const emptyInput: WrapInput = {
  eventName: "",
  eventDate: "",
  format: "live",
  hostNames: "",
  speakers: [],
  partners: [],
  recordingUrl: "",
  slidesUrl: "",
  photosUrl: "",
  feedbackUrl: "",
  nextEventName: "",
  nextEventUrl: "",
  highlights: [],
  numbers: "",
  tone: "warm",
  signoff: "",
};

export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function linkLines(i: WrapInput): string[] {
  const lines: string[] = [];
  if (i.recordingUrl.trim()) lines.push(`Recording: ${i.recordingUrl.trim()}`);
  if (i.slidesUrl.trim()) lines.push(`Slides: ${i.slidesUrl.trim()}`);
  if (i.photosUrl.trim()) lines.push(`Photos: ${i.photosUrl.trim()}`);
  return lines;
}

function opening(i: WrapInput): string {
  switch (i.tone) {
    case "warm":
      return "It was a genuine pleasure";
    case "crisp":
      return "Thank you";
    default:
      return "Thank you";
  }
}

function sign(i: WrapInput): string {
  return `Regards,\n${i.signoff.trim() || "[Your name]"}`;
}

function listBullets(items: string[]): string {
  if (items.length === 0) return "";
  return "\n\nA few moments that stood out:\n" + items.map((x) => `- ${x}`).join("\n");
}

export function speakerThankYou(i: WrapInput): { subject: string; body: string } {
  const subject = `Thank you for speaking at ${i.eventName || "[Event]"}${
    i.eventDate ? ` — ${i.eventDate}` : ""
  }`;
  const links = linkLines(i);
  const body = [
    `Hi {Name},`,
    ``,
    `${opening(i)} having you speak at ${i.eventName || "[Event]"}${i.eventDate ? ` on ${i.eventDate}` : ""}. Your session gave the room exactly the kind of grounded, first-hand perspective the discussion needed.`,
    listBullets(i.highlights),
    links.length > 0 ? `\nFor reference: ${links.join(" · ")}` : "",
    ``,
    `We would love to have you back for a future session — happy to shape a topic whenever it suits you.`,
    ``,
    sign(i),
  ]
    .filter((s) => s !== undefined && s !== "")
    .join("\n");
  return { subject, body };
}

export function attendeeRecap(i: WrapInput): { subject: string; body: string } {
  const subject = `${i.eventName || "[Event]"} — recap and resources`;
  const links = linkLines(i);
  const body = [
    `Hi,`,
    ``,
    `Thank you for joining ${i.eventName || "[Event]"}${i.eventDate ? ` on ${i.eventDate}` : ""}.${i.numbers.trim() ? ` ${i.numbers.trim()}` : ""}`,
    listBullets(i.highlights),
    links.length > 0 ? `\nRecap and resources:\n${links.join("\n")}` : "",
    i.feedbackUrl.trim() ? `\nWe would value your feedback (2 minutes): ${i.feedbackUrl.trim()}` : "",
    i.nextEventName.trim() || i.nextEventUrl.trim()
      ? `\nWhat's next: ${i.nextEventName.trim() || "We'll share details soon"}${i.nextEventUrl.trim() ? ` — ${i.nextEventUrl.trim()}` : ""}`
      : "",
    ``,
    sign(i),
  ]
    .filter((s) => s !== undefined && s !== "")
    .join("\n");
  return { subject, body };
}

export function partnerThanks(i: WrapInput): { subject: string; body: string } {
  const subject = `${i.eventName || "[Event]"} — thank you for partnering`;
  const links = linkLines(i);
  const body = [
    `Hi {Name},`,
    ``,
    `${opening(i)} partnering with us on ${i.eventName || "[Event]"}${i.eventDate ? ` on ${i.eventDate}` : ""}. The conversation brought together a focused group of practitioners and policymakers, and your support is part of what made that possible.`,
    listBullets(i.highlights),
    links.length > 0 ? `\nFor reference: ${links.join(" · ")}` : "",
    ``,
    `We are already shaping the next conversation and would value your thoughts on where it should go.`,
    ``,
    sign(i),
  ]
    .filter((s) => s !== undefined && s !== "")
    .join("\n");
  return { subject, body };
}

export function teamRecap(i: WrapInput): string {
  const links = linkLines(i);
  const lines = [
    `${i.eventName || "[Event]"}${i.eventDate ? ` — ${i.eventDate}` : ""} ${i.format} wrap`,
    ``,
    `- Attendance: ${i.numbers.trim() || "—"}`,
    ...i.highlights.map((h) => `- Highlight: ${h}`),
    links.length > 0 ? `- Links: ${links.join(" · ").replace(/^/, "")}` : "",
    `- Follow-ups: speaker thank-yous, partner notes, attendee recap — draft/queued`,
    i.nextEventName.trim() ? `- Next: ${i.nextEventName.trim()}` : "",
  ].filter((s) => s !== undefined && s !== "");
  return lines.join("\n");
}

export function socialPost(i: WrapInput): string {
  const links = linkLines(i);
  const lines = [
    `That's a wrap on ${i.eventName || "[Event]"}!${i.numbers.trim() ? ` ${i.numbers.trim()}.` : ""}`,
    i.highlights[0] ? `\nOne moment that stood out: ${i.highlights[0]}` : "",
    links.length > 0 ? `\n${links.join(" · ")}` : "",
    `\nThanks to everyone who joined${i.speakers.length > 0 ? `, and to our speakers` : ""}.`,
    i.nextEventName.trim() ? `\nNext up: ${i.nextEventName.trim()}` : "",
  ].filter((s) => s !== undefined && s !== "");
  return lines.join("\n");
}

export function buildAll(i: WrapInput): { key: string; label: string; subject?: string; text: string }[] {
  const out: { key: string; label: string; subject?: string; text: string }[] = [];
  if (i.speakers.length > 0 || i.eventName.trim()) {
    const s = speakerThankYou(i);
    out.push({ key: "speaker", label: "Speaker thank-you email", subject: s.subject, text: s.body });
  }
  if (i.eventName.trim()) {
    const a = attendeeRecap(i);
    out.push({ key: "attendee", label: "Attendee recap email", subject: a.subject, text: a.body });
  }
  if (i.partners.length > 0) {
    const p = partnerThanks(i);
    out.push({ key: "partner", label: "Partner / sponsor thank-you", subject: p.subject, text: p.body });
  }
  if (i.eventName.trim()) {
    out.push({ key: "team", label: "Internal team recap", text: teamRecap(i) });
    out.push({ key: "social", label: "Social post", text: socialPost(i) });
  }
  return out;
}

export function allAsText(i: WrapInput): string {
  const blocks = buildAll(i);
  return blocks
    .map((b) => {
      const head = b.subject ? `${b.label}\nSubject: ${b.subject}` : b.label;
      return `${head}\n${"-".repeat(Math.max(head.length, 12))}\n${b.text}`;
    })
    .join("\n\n" + "=".repeat(24) + "\n\n");
}
import "server-only";
import nodemailer from "nodemailer";

// Emailuri trimise de aplicație (parola contului de mentor, resetarea parolei), printr-un
// server SMTP. Se configurează în variabilele de mediu (local în .env.local, pe Vercel în
// setări): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
// Pentru Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_PASS = o „parolă de aplicație”.

export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

/** Trimite un email (text și, opțional, HTML). Întoarce false dacă nu e configurat SMTP sau trimiterea eșuează. */
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
) {
  if (!mailConfigured()) return false;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM ?? `EduQuest <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

const esc = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * Emailul cu aspectul EduQuest: titlu, paragrafe, un buton mare și o notă la final.
 * Tabele și stiluri inline, ca să arate la fel în Gmail, Outlook și pe telefon.
 */
export function emailHtml({
  title,
  paragraphs,
  button,
  details,
  note,
}: {
  title: string;
  paragraphs: string[];
  button: { label: string; href: string };
  /** Rânduri „etichetă: valoare” într-o casetă (ex. emailul și parola). */
  details?: [string, string][];
  note?: string;
}) {
  const p = (t: string) =>
    `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1d2a22">${esc(t)}</p>`;
  const box = details?.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;width:100%;background:#f6f1e7;border:1px solid #e0d6c3;border-radius:10px"><tr><td style="padding:14px 16px">${details
        .map(
          ([k, v]) =>
            `<div style="font-size:14px;line-height:1.7;color:#1d2a22"><span style="color:#6b6458">${esc(k)}:</span> <strong style="font-family:Consolas,Menlo,monospace">${esc(v)}</strong></div>`,
        )
        .join("")}</td></tr></table>`
    : "";
  const href = esc(button.href);
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#ece6d9;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece6d9"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 14px;font-size:18px;font-weight:800;letter-spacing:-0.2px;color:#1d2a22">Edu<span style="color:#b5532f">Quest</span></td></tr>
<tr><td style="background:#fffdf8;border:1px solid #e0d6c3;border-radius:16px;padding:28px 26px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1d2a22">${esc(title)}</h1>
${paragraphs.map(p).join("")}
${box}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="border-radius:10px;background:#1d2a22">
<a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#dcb514;text-decoration:none;border-radius:10px">${esc(button.label)}</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#6b6458">Dacă butonul nu merge, copiază adresa aceasta în browser:</p>
<p style="margin:0 0 4px;font-size:12px;line-height:1.5;word-break:break-all"><a href="${href}" style="color:#b5532f">${href}</a></p>
${note ? `<p style="margin:18px 0 0;padding-top:16px;border-top:1px solid #e0d6c3;font-size:12px;line-height:1.5;color:#6b6458">${esc(note)}</p>` : ""}
</td></tr>
<tr><td style="padding:14px 4px 0;font-size:12px;color:#6b6458">Echipa EduQuest</td></tr>
</table></td></tr></table></body></html>`;
}

/** Parolă aleatorie, ușor de copiat (fără caractere care se confundă: 0/O, 1/l/I). */
export function generatePassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

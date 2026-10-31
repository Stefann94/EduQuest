import "server-only";
import nodemailer from "nodemailer";

// Emailuri trimise de aplicație (ex. parola contului de mentor), printr-un server SMTP.
// Se configurează în variabilele de mediu (local în .env.local, pe Vercel în setări):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
// Pentru Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_PASS = o „parolă de aplicație”.

export function mailConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

/** Trimite un email text. Întoarce false dacă nu e configurat SMTP sau trimiterea eșuează. */
export async function sendMail(to: string, subject: string, text: string) {
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
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return true;
  } catch {
    return false;
  }
}

/** Parolă aleatorie, ușor de copiat (fără caractere care se confundă: 0/O, 1/l/I). */
export function generatePassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

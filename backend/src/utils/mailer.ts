import nodemailer from "nodemailer";

// Za razvoj/testiranje koristimo Ethereal (nodemailer.createTestAccount) -
// besplatan lazni SMTP nalog koji ne salje prave mejlove, vec generise link
// za pregled poslate poruke (ispisuje se u konzoli). Za pravu odbranu,
// zameniti sa realnim SMTP podacima (npr. Gmail app password) preko env
// promenljivih SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.
let transporterPromise: Promise<nodemailer.Transporter> | null = null;

function dobaviTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
      }
      const testNalog = await nodemailer.createTestAccount();
      console.log("Koristi se Ethereal test SMTP nalog:", testNalog.user);
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testNalog.user, pass: testNalog.pass },
      });
    })();
  }
  return transporterPromise;
}

// Ne baca gresku na neuspeh slanja - mejl je pomocna funkcionalnost i ne
// sme da blokira glavni tok (npr. raspisivanje licitacije, potvrda narudzbine).
export async function posaljiMejl(
  to: string,
  subject: string,
  text: string,
  attachments?: { filename: string; content: Buffer }[]
) {
  try {
    const transporter = await dobaviTransporter();
    const info = await transporter.sendMail({
      from: '"Printing House" <no-reply@printinghouse.rs>',
      to,
      subject,
      text,
      attachments,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Mejl poslat (${to}) - pregled: ${previewUrl}`);
    }
  } catch (err) {
    console.log("Slanje mejla nije uspelo:", err);
  }
}

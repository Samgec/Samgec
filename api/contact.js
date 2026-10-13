const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const body = req.body || {};
  const { nume, tel, email, judet, tip, mesaj, botcheck } = body;

  // Honeypot: real visitors never see or fill this field, so a non-empty
  // value means a bot filled every input it could find. Reply success so
  // the bot doesn't retry, but skip actually sending the email.
  if (botcheck) {
    return res.status(200).json({ success: true });
  }

  if (!nume || !tel || !judet || !tip) {
    return res.status(400).json({ success: false, message: "Lipsesc câmpuri obligatorii." });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("contact form: missing SMTP_HOST/SMTP_USER/SMTP_PASS env vars");
    return res.status(500).json({ success: false, message: "Formularul nu este configurat încă." });
  }

  const to = process.env.CONTACT_TO || "office@samgec.ro";
  const port = Number(process.env.SMTP_PORT || 587);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const text = [
      `Nume: ${nume}`,
      `Telefon: ${tel}`,
      `Email: ${email || "-"}`,
      `Județ: ${judet}`,
      `Tip interes: ${tip}`,
      `Detalii: ${mesaj || "-"}`,
    ].join("\n");

    await transporter.sendMail({
      from: `"Formular SAMGEC" <${process.env.SMTP_USER}>`,
      to: to,
      replyTo: email || undefined,
      subject: `Solicitare ofertă: ${tip} - ${nume}`,
      text: text,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("contact form send error", err);
    return res.status(500).json({ success: false, message: "Eroare la trimitere." });
  }
};

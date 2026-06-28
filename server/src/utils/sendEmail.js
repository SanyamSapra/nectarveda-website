import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const port = Number(process.env.EMAIL_PORT || 587);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// Verify SMTP once when the server starts
transporter
    .verify()
    .then(() => console.log("✅ Brevo SMTP Connected"))
    .catch((err) => console.error("❌ SMTP Error:", err));

const sendEmail = async ({ to, subject, html, from }) => {
    const sender = from || process.env.EMAIL_USER || process.env.EMAIL_FROM;
    const defaultFrom = `"NectarVeda" <${sender}>`;

    if (process.env.EMAIL_FROM && process.env.EMAIL_FROM !== process.env.EMAIL_USER && !from) {
        console.warn(
            `WARNING: EMAIL_FROM (${process.env.EMAIL_FROM}) differs from EMAIL_USER (${process.env.EMAIL_USER}). Using EMAIL_USER as sender to match authenticated SMTP credentials.`
        );
    }

    console.log(`Sending email from ${defaultFrom} to ${to}`);

    try {
        return await transporter.sendMail({
            from: defaultFrom,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

export default sendEmail;
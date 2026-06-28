// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import nodemailer from "nodemailer";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// const createTransporter = () =>
//     nodemailer.createTransport({
//         host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
//         port: Number(process.env.EMAIL_PORT || 587),
//         secure: false,
//         requireTLS: true,
//         family: 4,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//         connectionTimeout: 10000,
//         greetingTimeout: 10000,
//         socketTimeout: 10000,
//     });

// const sendEmail = async ({ to, subject, html, from }) => {
//     const transporter = createTransporter();

//     await transporter.verify();
//     await transporter.sendMail({
//         from: from || `"NectarVeda" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//     });
// };

// export default sendEmail;

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    await resend.emails.send({
        from: 'NectarVeda <onboarding@resend.dev>',
        to,
        subject,
        html,
    });
};

export default sendEmail;
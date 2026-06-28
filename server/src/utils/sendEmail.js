import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465,
    requireTLS: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

if (process.env.NODE_ENV !== "production") {
    transporter.verify((err) => {
        if (err) console.error("SMTP Error:", err);
        else console.log("✅ SMTP Ready");
    });
}

const sendEmail = async ({ to, subject, html, from }) => {
    return transporter.sendMail({
        from: from || `"NectarVeda" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
    });
};

export default sendEmail;
import nodemailer from "nodemailer";

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email service is not configured. Please set EMAIL_USER and EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NectarVeda" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;

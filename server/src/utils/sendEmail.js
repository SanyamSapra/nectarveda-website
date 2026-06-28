import axios from "axios";

if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing.");
}

if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is missing.");
}

const sendEmail = async ({ to, subject, html, text = "" }) => {
    try {
        const { data } = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: process.env.EMAIL_FROM_NAME || "NectarVeda",
                    email: process.env.EMAIL_FROM,
                },
                to: [{ email: to }],
                subject,
                htmlContent: html,
                textContent: text,
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 15000,
            }
        );

        return data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.response?.data ||
            error.message;

        console.error("Brevo Email Error:", message);
        throw new Error(message);
    }
};

export default sendEmail;
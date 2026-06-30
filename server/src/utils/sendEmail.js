import axios from "axios";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const MAX_EMAIL_ATTEMPTS = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildRecipients = (to) => {
    const recipients = Array.isArray(to) ? to : [to];

    return recipients
        .map((email) => String(email || "").trim())
        .filter(Boolean)
        .map((email) => ({ email }));
};

const shouldRetryEmail = (error) => {
    const status = error.response?.status;

    return (
        error.code === "ECONNABORTED" ||
        error.code === "ERR_NETWORK" ||
        !error.response ||
        status === 429 ||
        status >= 500
    );
};

const getBrevoErrorMessage = (error) => {
    const brevoMessage = error.response?.data?.message;
    const brevoCode = error.response?.data?.code;

    return brevoMessage || brevoCode || error.message;
};

const createEmailError = (message) => {
    const error = new Error(message);
    error.statusCode = 503;
    return error;
};

const sendEmail = async ({ to, subject, html, text = "" }) => {
    const recipients = buildRecipients(to);

    if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
        console.error("Email service is missing BREVO_API_KEY or EMAIL_FROM.");
        throw createEmailError("Email service is not configured. Please contact support.");
    }

    if (!recipients.length || !subject || (!html && !text)) {
        throw createEmailError("Email could not be sent because some details are missing.");
    }

    const payload = {
        sender: {
            name: process.env.EMAIL_FROM_NAME || "NectarVeda",
            email: process.env.EMAIL_FROM,
        },
        to: recipients,
        subject,
    };

    if (html) payload.htmlContent = html;
    if (text) payload.textContent = text;

    for (let attempt = 1; attempt <= MAX_EMAIL_ATTEMPTS; attempt += 1) {
        try {
            const { data } = await axios.post(
                BREVO_EMAIL_URL,
                payload,
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
            const canRetry = attempt < MAX_EMAIL_ATTEMPTS && shouldRetryEmail(error);

            console.error(
                `Brevo Email Error (attempt ${attempt}/${MAX_EMAIL_ATTEMPTS}):`,
                getBrevoErrorMessage(error)
            );

            if (!canRetry) {
                throw createEmailError("Unable to send email right now. Please try again in a few minutes.");
            }

            await sleep(500 * attempt);
        }
    }

    throw createEmailError("Unable to send email right now. Please try again in a few minutes.");
};

export default sendEmail;

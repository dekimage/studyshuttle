import mailgun from "mailgun.js";

// Initialize Mailgun

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

export const sendEmail = async ({ to, subject, text }) => {
  const data = {
    from: process.env.MAILGUN_SENDER_EMAIL,
    to,
    subject,
    text,
  };
  console.log({
    from: process.env.MAILGUN_SENDER_EMAIL,
    to,
    subject,
    text,
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  try {
    await mg.messages().send(data);
    return { success: true };
  } catch (error) {
    console.log("Error sending email:", error);
    return { error: "Failed to send email" };
  }
};

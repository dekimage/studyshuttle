import mailgun from "mailgun.js";
import formData from "form-data";

const mg = mailgun(formData);
const DOMAIN = process.env.MAILGUN_DOMAIN; // Add your Mailgun domain here
const mgClient = mg.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.eu.mailgun.net",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { subject, message, user } = req.body;

    const emailContent = `
      You have received a new message from ${user.firstName} ${user.lastName}:

      Subject: ${subject}

      Message:
      ${message}
    `;

    try {
      await mgClient.messages.create(DOMAIN, {
        from: "no-reply@example.com", // Replace with your verified sender email
        to: "admin@example.com", // Replace with your admin email
        subject: `New Feedback/Message from ${user.firstName} ${user.lastName}`,
        text: emailContent,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.log("Error sending email:", error);
      res.status(500).json({ error: "Error sending email" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

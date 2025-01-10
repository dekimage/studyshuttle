import FormData from "form-data";
import Mailgun from "mailgun.js";

// Initialize Mailgun with FormData
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // Make sure this environment variable is set
  url: "https://api.eu.mailgun.net",
});

export async function POST(req) {
  try {
    const { to, subject, text } = await req.json();

    console.log({ to, subject, text });

    if (!to || !subject || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    // Define your email data
    const emailData = {
      from: process.env.MAILGUN_SENDER_EMAIL, // Use a verified sender email
      to: to,
      subject,
      text,
    };

    // Send the email using Mailgun's messages API
    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      emailData,
    );

    return new Response(JSON.stringify({ success: true, data: response }), {
      status: 200,
    });
  } catch (error) {
    console.log("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Error sending email", details: error.message }),
      { status: 500 },
    );
  }
}

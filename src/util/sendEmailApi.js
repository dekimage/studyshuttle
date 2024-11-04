import axios from "axios";

export const sendEmailApi = async ({ to, subject, text }) => {
  const data = new URLSearchParams();
  data.append("from", process.env.MAILGUN_SENDER_EMAIL);
  data.append("to", to);
  data.append("subject", subject);
  data.append("text", text);

  try {
    const response = await axios.post(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      data,
      {
        auth: {
          username: "api",
          password: process.env.MAILGUN_API_KEY,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    console.log("Mailgun Response:", response.data); // Log the response to see what Mailgun returns
    return { success: true, data: response.data };
  } catch (error) {
    console.log("Error sending email:", error.response?.data || error.message);
    return { error: "Failed to send email" };
  }
};

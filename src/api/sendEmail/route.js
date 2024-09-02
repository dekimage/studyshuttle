import { sendEmail } from "@/utils/sendEmail";

export async function POST(req) {
  console.log("Sending email...");
  try {
    const { to, subject, text } = await req.json();

    if (!to || !subject || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    const result = await sendEmail({ to, subject, text });

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error handling email sending:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

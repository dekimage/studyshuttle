import { NextResponse } from "next/server";
import { auth } from "../../firebaseAdmin";

const SUPPORT_EMAIL = "andrej.ilievski1998@gmail.com ";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export async function POST(req) {
  try {
    const { subject, message } = await req.json();
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify the user's Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Validate the input
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: "Subject and message are required" },
        { status: 400 },
      );
    }

    // Sending email logic
    const emailPayload = {
      to: SUPPORT_EMAIL,
      subject: `Support Request: ${subject}`,
      text: `Message from user ${decodedToken.email}:\n\n${message}`,
    };

    await fetch(`${baseUrl}/api/sendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error sending support message:", error);
    return NextResponse.json(
      { success: false, error: "Error sending support message" },
      { status: 500 },
    );
  }
}

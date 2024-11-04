import { sendEmailApi } from "@/src/util/sendEmailApi";
import { db } from "../../firebaseAdmin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Log the request body to confirm data
    const { email } = await req.json();
    console.log("Received email for verification:", email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    // Fetch the user document based on email
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("email", "==", email).get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user is already verified
    if (userData.emailVerified) {
      return NextResponse.json({
        success: false,
        message: "User is already verified.",
      });
    }

    // Generate a new verification token
    const token = jwt.sign(
      { uid: userData.uid, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Define the verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    // Resend verification email
    const emailResult = await sendEmailApi({
      to: email,
      subject: "Verify your email",
      text: `Click on the following link to verify your email: ${verificationUrl}`,
    });

    if (emailResult.error) {
      console.error("Error resending email verification:", emailResult.error);
      return NextResponse.json(
        { success: false, error: emailResult.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully!",
    });
  } catch (error) {
    console.error("Error in resend-verification route:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}

import { db, admin } from "../../firebaseAdmin";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendEmailApi } from "@/src/util/sendEmailApi";

export async function POST(req) {
  try {
    const { email, password, name, lastname, academicLevel, phone } =
      await req.json();

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    /* Commenting out email verification for now
    // Generate a verification token with JWT (expires in 1 day for security)
    const token = jwt.sign(
      { uid: userRecord.uid, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Define the verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    // Send verification email using the new `sendEmail` function
    const emailResult = await sendEmailApi({
      to: email,
      subject: "Verify your email",
      text: `Click on the following link to verify your email: ${verificationUrl}`,
    });

    // Handle potential error from email sending
    if (emailResult.error) {
      console.log("Error sending email verification:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 },
      );
    }
    */

    // Create user profile in Firestore
    const newUserProfile = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name,
      lastname,
      academicLevel,
      email,
      phone,
      uid: userRecord.uid,
      role: "student",
      blueTokens: 0,
      yellowTokens: 0,
      redTokens: 0,
      emailVerified: true, // Changed to true since we're skipping verification
    };

    await db.collection("users").doc(userRecord.uid).set(newUserProfile);

    return NextResponse.json({
      success: true,
      message: "Signup successful!", // Removed verification message
    });
  } catch (error) {
    console.log("Error signing up:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

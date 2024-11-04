import { db } from "../../firebaseAdmin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Use the URL object to get the token from the query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 },
      );
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { uid } = decoded;

    // Update Firestore user document to set emailVerified to true
    await db.collection("users").doc(uid).update({ emailVerified: true });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.log("Error verifying email:", error);
    return NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 400 },
    );
  }
}

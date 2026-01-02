import { db } from "../../firebaseAdmin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // Get the token from the query parameters using NextRequest's nextUrl
    const token = req.nextUrl.searchParams.get("token");

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

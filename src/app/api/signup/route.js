import { db, admin } from "../../firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password, name, lastname, academicLevel } = await req.json();

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const newUserProfile = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name: name,
      lastname: lastname,
      academicLevel: academicLevel,
      email: email,
      uid: userRecord.uid,
      role: "student",
      blueTokens: 0,
      yellowTokens: 0,
      redTokens: 0,
    };

    await db.collection("users").doc(userRecord.uid).set(newUserProfile);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error signing up:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

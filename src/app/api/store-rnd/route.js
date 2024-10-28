import { NextResponse } from "next/server";
import { db } from "../../firebaseAdmin";

export async function POST(req) {
  const { rnd, userId, oid } = await req.json();

  if (!userId) {
    console.error("Invalid userId received:", userId);
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  try {
    await db.collection("users").doc(userId).update({
      temporaryOid: oid,
      temporaryRnd: rnd,
      paymentInfoTimestamp: new Date(),
    });

    return NextResponse.json({ message: "Payment info stored successfully" });
  } catch (error) {
    console.error("Error storing payment info:", error);
    return NextResponse.json(
      { error: "Failed to store payment info" },
      { status: 500 },
    );
  }
}

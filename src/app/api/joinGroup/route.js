import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin";

export async function POST(req) {
  try {
    // Parse the request body
    const { groupId } = await req.json();
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify the user's Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch the user's data from Firestore
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const userData = userDoc.data();

    // Check user role
    if (userData.role !== "student") {
      return NextResponse.json(
        { success: false, error: "Only students can join groups." },
        { status: 403 },
      );
    }

    // Check user's blue tokens
    if (userData.blueTokens < 1) {
      return NextResponse.json(
        { success: false, error: "Not enough blue tokens." },
        { status: 403 },
      );
    }

    // Fetch the group document
    const groupDocRef = db.collection("academyGroups").doc(groupId);
    const groupDoc = await groupDocRef.get();

    if (!groupDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Group not found." },
        { status: 404 },
      );
    }

    const groupData = groupDoc.data();

    // Check if the user is already in the group
    if (groupData.users && groupData.users.includes(userId)) {
      return NextResponse.json(
        { success: false, error: "User is already in the group." },
        { status: 400 },
      );
    }

    const newUserList = [...(groupData.users || []), userId];

    // Update the group with the new user list
    await groupDocRef.update({
      users: newUserList,
      activeUsers: newUserList.length,
    });

    // Update user's tokens
    await userDocRef.update({
      blueTokens: admin.firestore.FieldValue.increment(-1),
    });

    // Fetch professor data
    const professorDocRef = db
      .collection("professors")
      .doc(groupData.professorId);
    const professorDoc = await professorDocRef.get();

    if (!professorDoc.exists) {
      console.log("Professor not found.");
      return NextResponse.json(
        { success: false, error: "Professor not found" },
        { status: 404 },
      );
    }

    // Skip email sending part for now

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error joining group:", error);
    return NextResponse.json(
      { success: false, error: `Error joining group. ${error}` },
      { status: 500 },
    );
  }
}

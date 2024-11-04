import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin";

export async function POST(req) {
  try {
    const { name, subject, studentType, schedule } = await req.json();
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

    // Get user data to verify role
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    if (userData.role !== "professor") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Find the professor's ID based on the logged-in user's ID
    const professorQuery = db
      .collection("professors")
      .where("userId", "==", userId);
    const professorSnapshot = await professorQuery.get();

    if (professorSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Professor not found" },
        { status: 404 },
      );
    }

    const professorDoc = professorSnapshot.docs[0];
    const professorId = professorDoc.id;

    // Create the new academy group
    const newAcademyGroup = {
      name,
      subject,
      studentType,
      professorId,
      schedule,
      users: [],
      activeUsers: 0,
      maxUsers: 10,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("academyGroups").add(newAcademyGroup);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error creating academy group:", error);
    return NextResponse.json(
      { success: false, error: "Error creating academy group" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const { academyGroupId, updatedData } = await req.json();
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

    // Get user data to verify role
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    if (userData.role !== "professor") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Fetch the academy group to verify ownership
    const academyGroupRef = db.collection("academyGroups").doc(academyGroupId);
    const academyGroupDoc = await academyGroupRef.get();

    if (!academyGroupDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Academy group not found" },
        { status: 404 },
      );
    }

    const academyGroupData = academyGroupDoc.data();
    if (academyGroupData.professorId !== userData.professorId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Update the academy group with the new data
    await academyGroupRef.update(updatedData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error editing academy group:", error);
    return NextResponse.json(
      { success: false, error: "Error editing academy group" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { academyGroupId } = await req.json();
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

    // Get user data to verify role
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    if (userData.role !== "professor") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Fetch the academy group to verify ownership
    const academyGroupRef = db.collection("academyGroups").doc(academyGroupId);
    const academyGroupDoc = await academyGroupRef.get();

    if (!academyGroupDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Academy group not found" },
        { status: 404 },
      );
    }

    const academyGroupData = academyGroupDoc.data();
    if (academyGroupData.professorId !== userData.professorId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Delete the academy group document
    await academyGroupRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error deleting academy group:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting academy group" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin";

export async function POST(req) {
  try {
    const { date, timeRanges } = await req.json();
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

    // Find the professor's document
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
    let currentSchedule = professorDoc.data().schedule || [];

    // Remove entries older than one month if the schedule exceeds 50 entries
    if (currentSchedule.length > 50) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      currentSchedule = currentSchedule.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneMonthAgo;
      });
    }

    // Convert the date to a string in the format "YYYY-MM-DD"
    const dateString = new Date(date).toISOString().split("T")[0];

    // Check if the date already exists in the schedule
    const existingEntryIndex = currentSchedule.findIndex(
      (entry) => entry.date === dateString,
    );

    if (existingEntryIndex > -1) {
      // If the date exists, merge the new time ranges with the existing time ranges
      currentSchedule[existingEntryIndex].timeRanges.push(...timeRanges);
    } else {
      // If the date doesn't exist, add a new entry
      const newEntry = { date: dateString, timeRanges };
      currentSchedule.push(newEntry);
    }

    // Update the schedule in Firestore
    await professorDoc.ref.update({ schedule: currentSchedule });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error adding schedule entry:", error);
    return NextResponse.json(
      { success: false, error: "Error adding schedule entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { date, timeRangeToDelete } = await req.json();
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

    // Find the professor's document
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
    let currentSchedule = professorDoc.data().schedule || [];

    // Find the date entry
    const existingEntryIndex = currentSchedule.findIndex(
      (entry) => entry.date === date,
    );

    if (existingEntryIndex > -1) {
      // Filter out the time range to delete
      const updatedTimeRanges = currentSchedule[
        existingEntryIndex
      ].timeRanges.filter(
        (range) =>
          range.from !== timeRangeToDelete.from ||
          range.to !== timeRangeToDelete.to,
      );

      // If no time ranges are left, remove the entire date entry
      if (updatedTimeRanges.length === 0) {
        currentSchedule = currentSchedule.filter(
          (_, index) => index !== existingEntryIndex,
        );
      } else {
        currentSchedule[existingEntryIndex].timeRanges = updatedTimeRanges;
      }

      // Update the schedule in Firestore
      await professorDoc.ref.update({ schedule: currentSchedule });

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Date not found in schedule." },
        { status: 404 },
      );
    }
  } catch (error) {
    console.log("Error deleting time range:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting time range" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin";
import { classReservationTemplate } from "@/src/util/emailTemplates";
import { fetchUserProfileById } from "../joinGroup/route";
import { filterSubjectsByIds } from "@/src/constants";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req) {
  try {
    const { date, timeRange, userId, professorId, subject, classType, notes } =
      await req.json();
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify the user's Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    const currentUserId = decodedToken.uid;

    // Get user data to verify role and token balance
    const userDocRef = db.collection("users").doc(currentUserId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    if (userData.role !== "student") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    if (userData.yellowTokens <= 0) {
      return NextResponse.json(
        { success: false, error: "Not enough yellow tokens" },
        { status: 403 },
      );
    }

    // Fetch professor data
    const professorDocRef = db.collection("professors").doc(professorId);
    const professorSnapshot = await professorDocRef.get();

    if (!professorSnapshot.exists) {
      return NextResponse.json(
        { success: false, error: "Professor not found" },
        { status: 404 },
      );
    }

    const professorData = professorSnapshot.data();
    const currentSchedule = professorData.schedule || [];

    // Find the date entry in the professor's schedule
    const existingEntryIndex = currentSchedule.findIndex(
      (entry) => entry.date === date,
    );
    if (existingEntryIndex > -1) {
      const timeRangeIndex = currentSchedule[
        existingEntryIndex
      ].timeRanges.findIndex(
        (range) => range.from === timeRange.from && range.to === timeRange.to,
      );

      if (
        timeRangeIndex > -1 &&
        currentSchedule[existingEntryIndex].timeRanges[timeRangeIndex]
          .isScheduled
      ) {
        return NextResponse.json(
          { success: false, error: "This time range is already scheduled." },
          { status: 400 },
        );
      }

      // Mark the time range as scheduled
      currentSchedule[existingEntryIndex].timeRanges[
        timeRangeIndex
      ].isScheduled = true;
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "This time range is not available in the professor's schedule.",
        },
        { status: 400 },
      );
    }

    // Update the professor's schedule in Firestore
    await professorDocRef.update({ schedule: currentSchedule });

    // Subtract 1 yellow token from the user's balance
    const updatedUserTokens = userData.yellowTokens - 1;
    await userDocRef.update({ yellowTokens: updatedUserTokens });

    const event = {
      date,
      timeRange,
      userId: currentUserId,
      professorId,
      subject,
      classType,
      notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("events").add(event);

    // Fetch user and professor details for email notifications
    const professorUserData = await fetchUserProfileById(professorData.userId);

    if (!userData || !professorData) {
      throw new Error("Invalid student or professor ID");
    }

    const subjectLabel = filterSubjectsByIds([subject])[0]?.label;

    // Prepare email templates
    const { studentEmail, professorEmail } = classReservationTemplate(
      `${userData.name} ${userData.lastname}`,
      `${professorData.name} ${professorData.lastname}`,
      date,
      `${timeRange.from} - ${timeRange.to}`,
      subjectLabel,
      classType,
      notes,
      professorData.link,
    );

    // Send email to student
    await fetch(`${baseUrl}/api/sendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userData.email,
        subject: studentEmail.subject,
        text: studentEmail.text,
      }),
    });

    // Send email to professor
    await fetch(`${baseUrl}/api/sendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: professorUserData.data.email,
        subject: professorEmail.subject,
        text: professorEmail.text,
      }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Error creating event" },
      { status: 500 },
    );
  }
}

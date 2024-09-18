import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin";

export async function PUT(req) {
  try {
    const { event } = await req.json();
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

    // Get user data to verify role and professor ID
    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();

    if (userData.role !== "professor") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Fetch the event document
    const eventRef = db.collection("events").doc(event.id);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    const previousEvent = eventDoc.data();

    // Check if the event belongs to the authenticated professor
    if (previousEvent.professorId !== userData.professorId) {
      return NextResponse.json(
        { success: false, error: "Access denied: Not your event" },
        { status: 403 },
      );
    }

    // Validate scores
    const scores = event.scores;
    if (
      scores.attention < 1 ||
      scores.attention > 5 ||
      scores.memory < 1 ||
      scores.memory > 5 ||
      scores.skill < 1 ||
      scores.skill > 5 ||
      scores.interest < 1 ||
      scores.interest > 5
    ) {
      return NextResponse.json(
        { success: false, error: "Scores must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate comment length
    if (event.comment.length > 140) {
      return NextResponse.json(
        { success: false, error: "Comment must be 140 characters or less" },
        { status: 400 },
      );
    }

    const isEventGraded = previousEvent.isEventGraded;

    // Update the event document in Firestore
    await eventRef.update({
      scores: event.scores,
      comment: event.comment,
      isEventGraded: true,
    });

    // Update the user's subject scores in the subcollection
    const subjectRef = db
      .collection("users")
      .doc(event.userId)
      .collection("subjects")
      .doc(event.subject);
    const subjectDoc = await subjectRef.get();

    if (subjectDoc.exists) {
      const subjectData = subjectDoc.data();
      const totalEvents = subjectData.totalEvents;
      let updatedScores = { ...subjectData.totalScores };

      if (isEventGraded) {
        // Calculate the difference between the old and new scores
        const scoreDifferences = {
          attention: event.scores.attention - previousEvent.scores.attention,
          memory: event.scores.memory - previousEvent.scores.memory,
          skill: event.scores.skill - previousEvent.scores.skill,
          interest: event.scores.interest - previousEvent.scores.interest,
        };

        // Update the scores by adding the differences
        updatedScores.attention += scoreDifferences.attention;
        updatedScores.memory += scoreDifferences.memory;
        updatedScores.skill += scoreDifferences.skill;
        updatedScores.interest += scoreDifferences.interest;
      } else {
        // Add the new scores if the event was not previously graded
        updatedScores.attention += event.scores.attention;
        updatedScores.memory += event.scores.memory;
        updatedScores.skill += event.scores.skill;
        updatedScores.interest += event.scores.interest;
      }

      // Update the subject document
      await subjectRef.update({
        totalScores: updatedScores,
        totalEvents: isEventGraded ? totalEvents : totalEvents + 1,
      });
    } else {
      // Create a new subject document if it doesn't exist
      const initialScores = {
        totalScores: event.scores,
        totalEvents: 1,
      };
      await subjectRef.set(initialScores);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating event and subject scores:", error);
    return NextResponse.json(
      { success: false, error: "Error updating event and subject scores" },
      { status: 500 },
    );
  }
}

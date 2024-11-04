import { NextResponse } from "next/server";
import { db, auth, admin } from "../../firebaseAdmin"; // Ensure `admin` is used for Firestore operations

export async function POST(req) {
  try {
    // Parse the request body
    const {
      professorId,
      stars,
      existingReviewStars = null,
      reviewId = null,
    } = await req.json();
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

    // Validate star rating
    if (stars < 1 || stars > 5) {
      return NextResponse.json(
        { success: false, error: "Invalid star rating" },
        { status: 400 },
      );
    }

    if (reviewId) {
      // Handle updating an existing review
      try {
        const reviewDocRef = db.collection("reviews").doc(reviewId);
        const latestReviewDoc = await reviewDocRef.get();

        if (!latestReviewDoc.exists) {
          return NextResponse.json(
            { success: false, error: "Review not found" },
            { status: 404 },
          );
        }

        const latestReviewData = latestReviewDoc.data();
        const currentStars = latestReviewData.stars;

        if (currentStars === stars) {
          return NextResponse.json(
            {
              success: false,
              error:
                "New rating is the same as the current rating. No update needed.",
            },
            { status: 400 },
          );
        }

        await reviewDocRef.update({
          stars,
          date: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update the professor's average rating with the new rating
        await updateProfessorAverageRating(
          professorId,
          stars,
          existingReviewStars,
        );

        return NextResponse.json(
          { success: true, updated: true },
          { status: 200 },
        );
      } catch (error) {
        console.log("Error updating review:", error);
        return NextResponse.json(
          { success: false, error: "Error updating review" },
          { status: 500 },
        );
      }
    } else {
      // Handle creating a new review
      try {
        const newReview = {
          userId,
          professorId,
          stars,
          date: admin.firestore.FieldValue.serverTimestamp(), // Use Admin SDK's server timestamp
        };

        await db.collection("reviews").add(newReview);

        // Update the professor's average rating with the new rating
        await updateProfessorAverageRating(professorId, stars);

        return NextResponse.json(
          { success: true, updated: false },
          { status: 200 },
        );
      } catch (error) {
        console.log("Error creating review:", error);
        return NextResponse.json(
          { success: false, error: "Error creating review" },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.log("Error submitting review:", error);
    return NextResponse.json(
      { success: false, error: "Error submitting review" },
      { status: 500 },
    );
  }
}

// Helper function to update professor's average rating using Admin SDK
async function updateProfessorAverageRating(
  professorId,
  newRating,
  oldRating = null,
) {
  try {
    const professorDocRef = db.collection("professors").doc(professorId);
    const professorDoc = await professorDocRef.get();

    if (!professorDoc.exists) {
      console.log("Professor not found.");
      return { error: "Professor not found" };
    }

    const professorData = professorDoc.data();
    const { averageRating = 0, reviewCount = 0 } = professorData;

    let newAverageRating, newReviewCount;
    if (oldRating !== null) {
      // Adjust the average rating calculation if updating an existing review
      newAverageRating =
        (averageRating * reviewCount - oldRating + newRating) / reviewCount;
    } else {
      // Calculate the new average rating for a new review
      newReviewCount = reviewCount + 1;
      newAverageRating =
        (averageRating * reviewCount + newRating) / newReviewCount;
    }

    // Update the professor's document with the new average rating and review count using Admin SDK
    await professorDocRef.update({
      averageRating: newAverageRating,
      reviewCount: oldRating !== null ? reviewCount : newReviewCount,
    });

    return { success: true };
  } catch (error) {
    console.log("Error updating professor's average rating:", error);
    return { error: "Error updating professor's average rating" };
  }
}

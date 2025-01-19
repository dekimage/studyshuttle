import { db } from "../../firebaseAdmin";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.eu.mailgun.net",
});

// Updated score ranges based on your table
const SCORE_RANGES = {
  LOW: { min: 0, max: 150, pdf: "lowPDF" },
  MEDIUM: { min: 151, max: 225, pdf: "mediumPDF" },
  HIGH: { min: 226, max: 270, pdf: "highPDF" },
  VERY_HIGH: { min: 271, max: 300, pdf: "veryHighPDF" },
};

// Mapping of answers to scores
const ANSWER_SCORES = {
  "Никогаш": 1,
  "Ретко": 2,
  "Понекогаш": 3,
  "Често": 4,
  "Секогаш": 5,
};

export async function POST(req) {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Log the raw request body
    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);

    // Parse the JSON
    const body = JSON.parse(rawBody);
    console.log("Parsed body:", body);

    // Destructure the data from the request body
    const {
      email,
      answers,
      studentName,
      parentName,
      surname,
      city,
      language,
      parentEmail,
      parentPhone,
      schoolName,
    } = body;

    // Log the extracted fields for debugging
    console.log("Extracted fields:", {
      email,
      answers,
      studentName,
      parentName,
      surname,
      city,
      language,
      parentEmail,
      parentPhone,
      schoolName,
    });

    // Validate required fields
    if (!email || !answers || !Array.isArray(answers)) {
      console.log("Validation failed:", {
        hasEmail: !!email,
        hasAnswers: !!answers,
        isArray: Array.isArray(answers),
      });

      return new Response(
        JSON.stringify({
          error: "Invalid submission data",
          received: {
            email,
            answers,
          },
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Calculate total score only for valid multiple-choice answers
    let totalScore = 0;
    let validAnswersCount = 0;

    answers.forEach((answer) => {
      if (ANSWER_SCORES.hasOwnProperty(answer)) {
        totalScore += ANSWER_SCORES[answer];
        validAnswersCount++;
      }
    });

    // Ensure at least one valid multiple-choice answer
    if (validAnswersCount === 0) {
      return new Response(
        JSON.stringify({
          error: "No valid multiple-choice answers found",
          expectedAnswers: Object.keys(ANSWER_SCORES),
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Determine which PDF to send based on the score
    let pdfToSend;
    if (totalScore >= SCORE_RANGES.VERY_HIGH.min && totalScore <= SCORE_RANGES.VERY_HIGH.max) {
      pdfToSend = SCORE_RANGES.VERY_HIGH.pdf;
    } else if (totalScore >= SCORE_RANGES.HIGH.min && totalScore <= SCORE_RANGES.HIGH.max) {
      pdfToSend = SCORE_RANGES.HIGH.pdf;
    } else if (totalScore >= SCORE_RANGES.MEDIUM.min && totalScore <= SCORE_RANGES.MEDIUM.max) {
      pdfToSend = SCORE_RANGES.MEDIUM.pdf;
    } else {
      pdfToSend = SCORE_RANGES.LOW.pdf;
    }

    // Update lead in Firebase with the score and additional fields
    const leadRef = db.collection("leads").doc(email);
    await leadRef.set(
      {
        email,
        parentEmail,
        studentName,
        parentName,
        surname,
        city,
        language,
        parentPhone,
        schoolName,
        isFormSubmitted: true,
        totalScore,
        validAnswersCount,
        formSubmittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true } // Merge ensures existing data isn't overwritten
    );

    // Send email with the appropriate PDF
    const emailData = {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: email,
      subject: "Your Personalized Results",
      text: `Dear ${studentName},\n\nThank you for completing the assessment! Based on your responses, we've prepared a personalized PDF for you.\n\nYour total score was ${totalScore}.\n\nYou can download your personalized PDF here: [Link to ${pdfToSend}].\n\nBest regards,\nStudy Shuttle Team`,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        pdf: pdfToSend,
        message: "Form submission processed successfully",
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Error processing form submission:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing form submission",
        details: error.message,
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
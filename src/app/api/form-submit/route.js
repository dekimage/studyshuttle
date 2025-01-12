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
    const { email, answers } = await req.json();

    if (!email || !answers || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: "Invalid submission data" }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Filter and calculate total score
    let totalScore = 0;
    const scoringAnswers = [];

    answers.forEach((answer) => {
      if (ANSWER_SCORES.hasOwnProperty(answer)) {
        totalScore += ANSWER_SCORES[answer];
        scoringAnswers.push(answer);
      }
    });

    // Determine which PDF to send based on the score
    let pdfToSend;
    if (
      totalScore >= SCORE_RANGES.VERY_HIGH.min &&
      totalScore <= SCORE_RANGES.VERY_HIGH.max
    ) {
      pdfToSend = SCORE_RANGES.VERY_HIGH.pdf;
    } else if (
      totalScore >= SCORE_RANGES.HIGH.min &&
      totalScore <= SCORE_RANGES.HIGH.max
    ) {
      pdfToSend = SCORE_RANGES.HIGH.pdf;
    } else if (
      totalScore >= SCORE_RANGES.MEDIUM.min &&
      totalScore <= SCORE_RANGES.MEDIUM.max
    ) {
      pdfToSend = SCORE_RANGES.MEDIUM.pdf;
    } else {
      pdfToSend = SCORE_RANGES.LOW.pdf;
    }

    // Return debug info in response
    return new Response(
      JSON.stringify({
        success: true,
        email,
        answers,
        scoringAnswers,
        totalScore,
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

import { db } from "../../firebaseAdmin";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.eu.mailgun.net",
});

const SCORE_RANGES = {
  LOW: { min: 3, max: 6, pdf: "lowPDF" },
  MEDIUM: { min: 7, max: 10, pdf: "medPDF" },
  HIGH: { min: 11, max: 12, pdf: "highPDF" },
};

export async function POST(req) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { email, answers } = await req.json();

    if (!email || !answers || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: "Invalid submission data" }),
        { 
          status: 400,
          headers 
        }
      );
    }

    // Calculate total scores
    const scoreMap = { a: 4, b: 3, c: 2, d: 1 };
    const totalScore = answers.reduce((sum, answer) => sum + scoreMap[answer.toLowerCase()], 0);

    // Determine which PDF to send
    let pdfToSend;
    if (totalScore >= SCORE_RANGES.HIGH.min && totalScore <= SCORE_RANGES.HIGH.max) {
      pdfToSend = SCORE_RANGES.HIGH.pdf;
    } else if (totalScore >= SCORE_RANGES.MEDIUM.min && totalScore <= SCORE_RANGES.MEDIUM.max) {
      pdfToSend = SCORE_RANGES.MEDIUM.pdf;
    } else {
      pdfToSend = SCORE_RANGES.LOW.pdf;
    }

    // Update lead in Firebase
    const leadRef = db.collection("leads").doc(email);
    await leadRef.update({
      isFormSubmitted: true,
      totalScore,
      formSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Send email with appropriate PDF
    const emailData = {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: email,
      subject: "Your Personalized Results",
      text: `Thank you for completing the assessment! Based on your responses, we've prepared a personalized PDF for you. Your total score was ${totalScore}. [Link to ${pdfToSend} will be here]`
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        pdf: pdfToSend,
        message: "Form submission processed successfully"
      }),
      { 
        status: 200,
        headers 
      }
    );

  } catch (error) {
    console.error("Error processing form submission:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing form submission",
        details: error.message
      }),
      { 
        status: 500,
        headers 
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

import { db } from "../../firebaseAdmin";
import { sendEmail } from "@/src/util/sendEmail";
import { headers } from 'next/headers';

const SCORE_RANGES = {
  LOW: { min: 3, max: 6, pdf: "lowPDF" },
  MEDIUM: { min: 7, max: 10, pdf: "medPDF" },
  HIGH: { min: 11, max: 12, pdf: "highPDF" },
};

export async function POST(req) {
  console.log('Form submission API called');
  
  // Handle CORS
  const headersList = headers();
  const origin = headersList.get('origin') || '*';

  try {
    const body = await req.json();
    console.log('Received payload:', body);

    const { email, answers } = body;

    if (!email || !answers || !Array.isArray(answers)) {
      console.log('Invalid submission data:', { email, answers });
      return new Response(
        JSON.stringify({ error: "Invalid submission data" }),
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Calculate total score
    const scoreMap = { a: 4, b: 3, c: 2, d: 1 };
    const totalScore = answers.reduce((sum, answer) => sum + scoreMap[answer.toLowerCase()], 0);
    console.log('Calculated score:', totalScore);

    // Determine which PDF to send
    let pdfToSend;
    if (totalScore >= SCORE_RANGES.HIGH.min && totalScore <= SCORE_RANGES.HIGH.max) {
      pdfToSend = SCORE_RANGES.HIGH.pdf;
    } else if (totalScore >= SCORE_RANGES.MEDIUM.min && totalScore <= SCORE_RANGES.MEDIUM.max) {
      pdfToSend = SCORE_RANGES.MEDIUM.pdf;
    } else {
      pdfToSend = SCORE_RANGES.LOW.pdf;
    }
    console.log('Selected PDF:', pdfToSend);

    // Update lead in Firebase
    console.log('Updating lead in Firebase for email:', email);
    const leadRef = db.collection("leads").doc(email);
    await leadRef.update({
      isFormSubmitted: true,
      totalScore,
      formSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Firebase update successful');

    // Send email with appropriate PDF
    console.log('Sending email to:', email);
    await sendEmail({
      to: email,
      subject: "Your Personalized Results",
      text: `Thank you for completing the assessment! Based on your responses, we've prepared a personalized PDF for you. Your total score was ${totalScore}. [Link to ${pdfToSend} will be here]`
    });
    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        score: totalScore,
        pdf: pdfToSend 
      }),
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        }
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
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(req) {
  const headersList = headers();
  const origin = headersList.get('origin') || '*';

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

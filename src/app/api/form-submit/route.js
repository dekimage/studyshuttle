import { db } from "../../firebaseAdmin";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.eu.mailgun.net",
});

// Updated score ranges with Google Drive links
const SCORE_RANGES = {
  LOW: {
    min: 0,
    max: 150,
    pdf: "https://drive.google.com/file/d/1dW0DCeTweud2LNDXoyGPXxZmhLFJtjgi/view?usp=drive_link"
  },
  MEDIUM: {
    min: 181,
    max: 225,
    pdf: "https://drive.google.com/file/d/1dkFoG03xD5fuk4zy1UaBExQJWQRLsYoS/view?usp=drive_link"
  },
  HIGH: {
    min: 226,
    max: 270,
    pdf: "https://drive.google.com/file/d/1lM2lTu-WXQnbH7hAWqTApJVQ5GeIQRq6/view?usp=drive_link"
  },
  VERY_HIGH: {
    min: 271,
    max: 300,
    pdf: "https://drive.google.com/file/d/1DulnpT7aZot1WuHdmn8IzPugXkokwSWO/view?usp=drive_link"
  },
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

    // Destructure the data from the request body with default values
    const {
      email = '',
      answers = [],
      studentName = '',
      parentName = '',
      surname = '',
      city = '',
      language = '',
      parentPhone = '',
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
      parentPhone,
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
          received: body,  // Log the entire received body
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

    // First get the existing document
    const existingDoc = await leadRef.get();
    const existingData = existingDoc.exists ? existingDoc.data() : {};

    // Create a clean document object with no undefined values
    const documentData = {
      email: email.trim(),
      studentName: studentName?.trim() || '',
      parentName: parentName?.trim() || '',
      surname: surname?.trim() || '',
      city: city?.trim() || '',
      language: language?.trim() || '',
      parentPhone: parentPhone?.trim() || '',
      isFormSubmitted: true,
      totalScore,
      validAnswersCount,
      formSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Then set the new data while preserving existing fields
    await leadRef.set(
      {
        ...existingData,
        ...documentData,
      },
      { merge: true }
    );

    // Send email with the appropriate PDF
    const emailData = {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: email,
      subject: "Вашиот персонализиран план – Study Shuttle",
      text: `Почитуван/а ${studentName},

Ви благодариме што го пополнивте формуларот за академска евалуација за ${studentName}!

По внимателното разгледување на Вашите одговори, нашиот тим подготви план кој најсоодветно ги одговара Вашите потреби и цели.

Во продолжение Ви го испраќаме линкот до препорачаниот план:
${pdfToSend}

Во планот е наведена и препорачаната фаза во која најдобро се вклопувате според информациите добиени од формуларот. Доколку имате какви било прашања околу чекорите, фазите или сакате дополнителни насоки, слободно контактирајте нè на studyshuttlemk@gmail.com.

Со нетрпение очекуваме да работиме заедно кон постигнување на Вашите академски цели!

Поздрав и пријатен ден,
Тимот на Study Shuttle
studyshuttlemk@gmail.com
www.studyshuttle.mk`,
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
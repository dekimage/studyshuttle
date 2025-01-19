export async function POST(req) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Log the raw request body
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Parse the JSON
    const body = JSON.parse(rawBody);
    console.log('Parsed body:', body);

    // Destructure data from the request body
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

    // Log extracted fields for debugging
    console.log('Extracted fields:', {
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

    // Validation
    if (
      !email ||
      !parentEmail ||
      !answers ||
      !Array.isArray(answers) ||
      !studentName ||
      !parentName ||
      !surname ||
      !city ||
      !language ||
      !parentPhone ||
      !schoolName
    ) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          received: {
            email,
            parentEmail,
            answers,
            studentName,
            parentName,
            surname,
            city,
            language,
            parentPhone,
            schoolName,
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
      // Only process answers that match our scoring system
      if (ANSWER_SCORES.hasOwnProperty(answer)) {
        totalScore += ANSWER_SCORES[answer];
        validAnswersCount++;
      }
    });

    // Ensure at least one valid multiple-choice answer
    if (validAnswersCount === 0) {
      return new Response(
        JSON.stringify({
          error: 'No valid multiple-choice answers found',
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

    // Update lead in Firestore with additional fields
    const leadRef = db.collection('leads').doc(email);
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

    // Send email with appropriate PDF
    const emailData = {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: email,
      subject: 'Your Personalized Results',
      text: `Dear ${studentName},\n\nThank you for completing the assessment! Based on your responses, we've prepared a personalized PDF for you.\n\nYour total score was ${totalScore}.\n\nYou can download your personalized PDF here: [Link to ${pdfToSend}].\n\nBest regards,\nStudy Shuttle Team`,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        pdf: pdfToSend,
        message: 'Form submission processed successfully',
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Error processing form submission:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing form submission',
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
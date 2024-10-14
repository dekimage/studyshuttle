import { NextResponse } from "next/server"; // Import NextResponse
import { parse } from "querystring";
export async function POST(req) {
  try {
    const bodyText = await req.text();
    const parsedBody = parse(bodyText);

    // Log the parsed data to check the reason for failure
    console.log("Payment failure data received:", parsedBody);

    // Respond with the failure details without redirecting
    return new NextResponse(
      `<html><body>
        <h1>Payment Failed</h1>
        <p>Error Message: ${parsedBody.ErrMsg}</p>
        <p>Error Code: ${parsedBody.ErrorCode}</p>
        <p>Response: ${parsedBody.Response}</p>
        <p>ProcReturnCode: ${parsedBody.ProcReturnCode}</p>
        <p>Additional Details:</p>
        <pre>${JSON.stringify(parsedBody, null, 2)}</pre>
        </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } },
    );
  } catch (error) {
    console.error("Error in payment fail handler: ", error);
    return new NextResponse(
      JSON.stringify({
        message: "Error processing the payment fail.",
        error: error.message,
      }),
      { status: 500 },
    );
  }
}

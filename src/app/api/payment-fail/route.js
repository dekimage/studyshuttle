// pages/api/payment-fail.js
export async function POST(req) {
  console.log(1111, req);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  return res.status(200).json({ message: "Payment failed. Please try again." });
}

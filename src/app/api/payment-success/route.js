// pages/api/payment-success.js
import crypto from "crypto";
// import { db } from "../../firebase";

function verifyHash(params, storeKey) {
  const hashParams = params.HASHPARAMS;
  const hashParamsVal = params.HASHPARAMSVAL;
  const hashParam = params.HASH;
  let paramsVal = "";

  // Extract values for hash calculation
  hashParams.split(":").forEach((param) => {
    paramsVal += params[param] || "";
  });

  // Compare the concatenated values
  if (paramsVal !== hashParamsVal) {
    return false; // If concatenated values do not match, hash is invalid
  }

  // Generate the hash for verification
  const hashString = paramsVal + storeKey;
  const calculatedHash = crypto
    .createHash("sha1")
    .update(hashString)
    .digest("base64");

  // Compare the calculated hash with the received hash
  return calculatedHash === hashParam;
}

export async function POST(req, res) {
  console.log(222, req, 333, res);
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const storeKey = "TEST1787";
  const params = req.body;

  // Verify the hash to ensure the response is valid
  if (!verifyHash(params, storeKey)) {
    return res
      .status(400)
      .json({ error: "Invalid hash. Potential tampering detected." });
  }

  if (params.Response === "Approved") {
    try {
      // Create order in Firestore
      // await db.collection("orders").add({
      //   orderId: params.oid,
      //   amount: params.amount,
      //   status: "Approved",
      //   transactionId: params.TransId,
      //   authCode: params.AuthCode,
      //   date: new Date(),
      // });
      console.log("creating order...");
      return res
        .status(200)
        .json({ message: "Payment successful and order created." });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error creating order in Firestore." });
    }
  } else {
    return res.status(400).json({ error: "Payment not approved." });
  }
}

// app/api/payment-success/route.js
import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "../../firebaseAdmin";

async function verifyHash(params, storeKey) {
  const hashParam = params.HASH || "";

  // Retrieve the stored rnd from the user document using the oid
  const userSnapshot = await db
    .collection("users")
    .where("temporaryOid", "==", params.oid)
    .get();

  if (userSnapshot.empty) {
    console.error("No user found with oid:", params.oid);
    return false;
  }

  const userDoc = userSnapshot.docs[0];
  const storedRnd = userDoc.data().temporaryRnd;

  if (!storedRnd) {
    console.error("Stored rnd not found for oid:", params.oid);
    return false;
  }

  console.log("Retrieved stored rnd value:", storedRnd);

  console.log("Backend hash verification:");
  console.log("amount:", params.amount);
  console.log("clientid:", params.clientid);
  console.log("currency:", params.currency);
  console.log("failUrl:", params.failUrl);
  console.log("hashAlgorithm:", params.hashAlgorithm);
  console.log("lang:", params.lang);
  console.log("oid:", params.oid);
  console.log("okUrl:", params.okUrl);
  console.log("refreshtime:", params.refreshtime);
  console.log("rnd:", storedRnd);
  console.log("storetype:", params.storetype);
  console.log("trantype:", params.trantype);
  console.log("storeKey:", storeKey);

  const plaintext = `${params.amount}|${params.clientid}|${params.currency}|${params.failUrl}|${params.hashAlgorithm}|${params.lang}|${params.oid}|${params.okUrl}|${params.refreshtime}|${storedRnd}|${params.storetype}|${params.trantype}|${storeKey}`;

  console.log("Plaintext for hash verification (backend):", plaintext);

  const calculatedHash = crypto
    .createHash("sha512")
    .update(plaintext, "utf8")
    .digest("base64");

  console.log("Calculated hash (backend):", calculatedHash);
  console.log("Received hash (from gateway):", hashParam);

  return calculatedHash === hashParam;
}

async function verifyTransaction(params) {
  console.log("Verifying transaction with params:", params);

  const userSnapshot = await db
    .collection("users")
    .where("temporaryOid", "==", params.oid)
    .get();

  if (userSnapshot.empty) {
    console.error("No user found with oid:", params.oid);
    return false;
  }

  const userDoc = userSnapshot.docs[0];
  const storedData = userDoc.data();

  console.log("Stored data:", storedData);

  if (!storedData.temporaryRnd || !storedData.temporaryOid) {
    console.error("Stored rnd or oid not found for oid:", params.oid);
    return false;
  }

  if (params.oid !== storedData.temporaryOid) {
    console.error("Received oid does not match stored oid");
    return false;
  }

  console.log("Transaction verified successfully");
  return true;
}

export async function POST(req) {
  const formData = await req.formData();

  const params = {};
  for (const [key, value] of formData.entries()) {
    params[key] = value;
  }

  console.log("Received payment response:", params);

  // Verify the transaction using our stored data
  if (!(await verifyTransaction(params))) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid transaction. Verification failed." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (params.Response === "Approved") {
    try {
      // Create order in Firestore
      await db.collection("orders").add({
        orderId: params.oid,
        amount: params.amount,
        status: "Approved",
        transactionId: params.TransId,
        authCode: params.AuthCode,
        date: new Date(),
      });

      console.log("Order created successfully.");

      return new NextResponse(
        JSON.stringify({
          message: "Payment successful and order created.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error creating order:", error);
      return new NextResponse(
        JSON.stringify({ error: "Error creating order in Firestore." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  } else {
    return new NextResponse(
      JSON.stringify({ error: "Payment not approved." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}

import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "../../firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

async function verifyHash(params, storeKey) {
  const hashParam = params.HASH || "";

  // Retrieve the stored rnd from the user document using the oid
  const userSnapshot = await db
    .collection("users")
    .where("temporaryOid", "==", params.oid)
    .get();

  if (userSnapshot.empty) {
    console.log("No user found with oid:", params.oid);
    return false;
  }

  const userDoc = userSnapshot.docs[0];
  const storedRnd = userDoc.data().temporaryRnd;

  if (!storedRnd) {
    console.log("Stored rnd not found for oid:", params.oid);
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
    console.log("No user found with oid:", params.oid);
    return false;
  }

  const userDoc = userSnapshot.docs[0];
  const storedData = userDoc.data();

  console.log("Stored data:", storedData);

  if (!storedData.temporaryRnd || !storedData.temporaryOid) {
    console.log("Stored rnd or oid not found for oid:", params.oid);
    return false;
  }

  if (params.oid !== storedData.temporaryOid) {
    console.log("Received oid does not match stored oid");
    return false;
  }

  // Verify the amount
  const validAmounts = [1250, 36000, 72000];
  if (!validAmounts.includes(Number(params.amount))) {
    console.log("Invalid amount:", params.amount);
    return false;
  }

  console.log("Transaction verified successfully");
  return true;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
console.log("BASE_URL:", BASE_URL);

export async function POST(req) {
  const formData = await req.formData();

  const params = {};
  for (const [key, value] of formData.entries()) {
    params[key] = value;
  }

  console.log("Received payment response:", params);

  // Verify the transaction using our stored data
  if (!(await verifyTransaction(params))) {
    return new Response(
      `<html>
        <head>
          <meta http-equiv="refresh" content="0;url=/payment-result?status=error&message=${encodeURIComponent(
            "Invalid transaction",
          )}">
        </head>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  if (params.Response === "Approved") {
    try {
      // Fetch the user document
      const userSnapshot = await db
        .collection("users")
        .where("temporaryOid", "==", params.oid)
        .get();

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        let tokensToAdd = {};
        let tokenType = "";
        let tokenAmount = 0;

        switch (Number(params.amount)) {
          case 1250:
            tokensToAdd = { yellowTokens: FieldValue.increment(1) };
            tokenType = "yellowTokens";
            tokenAmount = 1;
            break;
          case 36000:
            tokensToAdd = { yellowTokens: FieldValue.increment(48) };
            tokenType = "yellowTokens";
            tokenAmount = 48;
            break;
          case 72000:
            tokensToAdd = { blueTokens: FieldValue.increment(1) };
            tokenType = "blueTokens";
            tokenAmount = 1;
            break;
        }

        const tokenSummary = {
          before: {
            yellowTokens: userData.yellowTokens || 0,
            blueTokens: userData.blueTokens || 0,
          },
          after: {
            yellowTokens:
              (userData.yellowTokens || 0) +
              (tokenType === "yellowTokens" ? tokenAmount : 0),
            blueTokens:
              (userData.blueTokens || 0) +
              (tokenType === "blueTokens" ? tokenAmount : 0),
          },
        };

        // Create order in Firestore
        await db.collection("orders").add({
          userId: userDoc.id,
          orderId: params.oid,
          amount: params.amount,
          status: "Approved",
          transactionId: params.TransId,
          authCode: params.AuthCode,
          date: new Date(),
          tokenSummary: tokenSummary,
          tokenType: tokenType,
          tokenAmount: tokenAmount,
        });

        console.log("Order created successfully.");

        // Update user's tokens
        await userDoc.ref.update(tokensToAdd);
        console.log("User tokens updated successfully.");

        // No need to fetch updated user data, we already calculated the correct values

        return new Response(
          `<html>
            <head>
              <meta http-equiv="refresh" content="5;url=/payment-result?status=success&tokenType=${tokenType}&tokenAmount=${tokenAmount}">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f0f0f0;
                }
                .container {
                  text-align: center;
                  padding: 20px;
                  background-color: white;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h1 {
                  color: #4CAF50;
                  font-size: 24px;
                }
                p {
                  font-size: 18px;
                  margin-bottom: 20px;
                }
                .button {
                  background-color: #4CAF50;
                  border: none;
                  color: white;
                  padding: 15px 32px;
                  text-align: center;
                  text-decoration: none;
                  display: inline-block;
                  font-size: 16px;
                  margin: 4px 2px;
                  cursor: pointer;
                  border-radius: 5px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Payment Successful!</h1>
                <p>You've earned ${tokenAmount} ${
                  tokenType === "yellowTokens" ? "Yellow" : "Blue"
                } Token(s).</p>
                <p>Redirecting to payment result page...</p>
                <a href="/payment-result?status=success&tokenType=${tokenType}&tokenAmount=${tokenAmount}" class="button">Go to Result Page</a>
              </div>
            </body>
          </html>`,
          {
            headers: { "Content-Type": "text/html" },
          },
        );
      }
    } catch (error) {
      console.log("Error processing payment:", error);
      return new Response(
        `<html>
          <head>
            <meta http-equiv="refresh" content="0;url=/payment-result?status=error&message=${encodeURIComponent(
              "Error processing payment",
            )}">
          </head>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }
  } else {
    return new Response(
      `<html>
        <head>
          <meta http-equiv="refresh" content="0;url=/payment-result?status=error&message=${encodeURIComponent(
            "Payment not approved",
          )}">
        </head>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}

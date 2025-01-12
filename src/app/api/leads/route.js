import { db } from "../../firebaseAdmin";

export async function POST(req) {
  try {
    const { parentName, childName, familySurname, email, phone, affiliateCode } = await req.json();

    console.log(
      {
        parentName,
        childName,
        familySurname,
        email,
        phone,
        affiliateCode,
      }
    )


    if (!email || !parentName || !childName || !familySurname) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Check if lead already exists
    const leadDoc = await db.collection("leads").doc(email).get();
    
    if (leadDoc.exists) {
      // Update only the affiliateCode if lead exists
      await db.collection("leads").doc(email).update({
        email,
        parentName,
        phone,
        childName,
        familySurname,
        affiliateCode: affiliateCode || null,
        updatedAt: new Date().toISOString(),
        createdAt: leadDoc.data().createdAt || new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Lead updated with new affiliate code" 
        }),
        { status: 200 }
      );
    }

    // Create new lead with email as document ID
    await db.collection("leads").doc(email).set({
      email,
      parentName,
      phone,
      childName,
      familySurname,
      affiliateCode: affiliateCode || null,
      isFormSubmitted: false,
      totalScore: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Lead created successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error storing lead:", error);
    return new Response(
      JSON.stringify({ error: "Error storing lead", details: error.message }),
      { status: 500 }
    );
  }
}

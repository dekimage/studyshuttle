"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

export const dynamic = 'force-dynamic';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    const tokenType = searchParams.get("tokenType");
    const tokenAmount = searchParams.get("tokenAmount");

    setPaymentStatus({
      status,
      message,
      tokenType,
      tokenAmount: tokenAmount ? parseInt(tokenAmount, 10) : undefined,
    });
  }, [searchParams]);

  const handleRedirect = () => {
    if (paymentStatus?.status === "error") {
      router.push("/support");
    } else {
      router.push("/pocetna");
    }
  };

  if (!paymentStatus) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>
        {paymentStatus.status === "success"
          ? "Payment Successful!"
          : "Payment Error"}
      </h1>
      {paymentStatus.status === "success" ? (
        <p>
          You earned: {paymentStatus.tokenAmount}{" "}
          {paymentStatus.tokenType === "yellowTokens" ? "Yellow" : "Blue"}{" "}
          Token(s)
        </p>
      ) : (
        <p>{paymentStatus.message}</p>
      )}
      <button onClick={handleRedirect}>
        {paymentStatus.status === "success" ? "Go to Home" : "Contact Support"}
      </button>
    </div>
  );
}

export default function PaymentResult() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}

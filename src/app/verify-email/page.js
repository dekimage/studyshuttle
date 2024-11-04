"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobxStore from "../mobx";
import { toJS } from "mobx";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = MobxStore;

  console.log(toJS(user));

  // Check for token in URL to verify email
  useEffect(() => {
    // Extract token from URL after the component is mounted (client-side only)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log("Token found:", token);

    if (token) {
      verifyEmailToken(token);
    }
  }, []);

  // Function to verify email with the token
  const verifyEmailToken = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/verify-email?token=${token}`, {
        method: "GET",
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Your email has been verified! Redirecting...");
        // Redirect to home or login after successful verification
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(
          "Invalid or expired token. Please try resending the verification email.",
        );
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to resend verification email
  const resendVerificationEmail = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }), // Pass the email in the request body
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Verification email sent. Please check your inbox.");
      } else {
        setMessage("Error resending verification email.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2>Please Verify Your Email</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p>
              {message ||
                "Check your email for a verification link to complete registration."}
            </p>
            {(!message || message.includes("Invalid or expired token")) && (
              <button onClick={resendVerificationEmail} className="mt-4">
                Resend Verification Email
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

"use client";

import { useEffect, useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CgSpinner } from "react-icons/cg";
import MobxStore from "../mobx";
import { useRouter } from "next/navigation";

const ForgotPasswordForm = () => {
  const { user, userReady } = MobxStore;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestCount, setRequestCount] = useState(0); // Track number of requests
  const [cooldown, setCooldown] = useState(false); // Track cooldown state
  const router = useRouter();

  useEffect(() => {
    if (user && userReady) {
      router.push("/pocetna");
    }
  }, [user, userReady, router]);

  const handleForgotPassword = async () => {
    if (cooldown) {
      setError("Прекумерно барање за ресетирање. Обидете се повторно подоцна.");
      return;
    }

    const auth = getAuth();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Линк за ресетирање на лозинка е испратен на вашата емаил адреса.",
      );

      setRequestCount((prevCount) => prevCount + 1); // Use functional state update

      // Set cooldown after a certain number of requests
      if (requestCount + 1 >= 3) {
        setCooldown(true);
        setTimeout(() => {
          setCooldown(false);
          setRequestCount(0); // Reset request count after cooldown
        }, 30000); // 30 seconds cooldown, adjust as needed
      }
    } catch (err) {
      setError("Ако емаил адресата е точна, линкот за ресетирање е испратен."); // Generic error message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[700px] flex-col items-center justify-center space-y-4 px-2 sm:px-16">
      <Input
        id="email"
        type="email"
        placeholder="Внесете ја вашата емаил адреса"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading || cooldown}
      />
      <Button
        className="w-full bg-sun font-bold text-black hover:bg-sun"
        onClick={handleForgotPassword}
        disabled={isLoading || cooldown}
      >
        {isLoading && <CgSpinner className="mr-2 h-4 w-4 animate-spin" />}
        Испрати линк за ресетирање на лозинка
      </Button>
      {message && <p className="text-green-500">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ForgotPasswordForm;

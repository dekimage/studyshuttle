"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import MobxStore from "../mobx";
import withAuth from "@/src/Components/AuthHoc";

const SupportPage = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // To display status messages

  const sendMessage = async () => {
    setStatus(""); // Clear status before sending
    const result = await MobxStore.sendSupportMessage(subject, message);

    if (result.success) {
      setStatus("Message sent successfully!");
      setSubject("");
      setMessage("");
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-lightGrey">
      <div className="flex w-full max-w-[480px] flex-col items-center justify-center gap-4 rounded-lg bg-white p-8">
        <div className="text-[35px] font-bold">Пријави проблем</div>
        <div className="w-full space-y-2">
          <Label htmlFor="name">Наслов</Label>
          <Input
            id="name"
            placeholder="Внесете го насловот"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="message">Порака</Label>
          <Input
            id="message"
            multiline
            rows="4"
            cols="50"
            placeholder="Внесе ја пораката"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          className="w-full bg-darkGrey hover:bg-darkGrey"
          onClick={() => sendMessage()}
        >
          Испрати
        </Button>
        {status && <div className="mt-4 text-center">{status}</div>}
      </div>
    </div>
  );
};

export default withAuth(SupportPage);

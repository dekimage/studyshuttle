"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Title } from "../_components/ReusableDivs";

const SupportPage = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const sendMessage = () => {
    // console.log(subject, message);
    // sendMessageApi(subject, message)
  };
  return (
    <div className="flex flex-col">
      <Title>ИТ Поддршка</Title>

      <div className="border-200-gray flex w-full max-w-[480px] flex-col items-center justify-center gap-4 border p-4">
        <div className="text-2xl">Пријави проблем</div>
        <div className="w-full space-y-2">
          <Label htmlFor="name">Наслов</Label>
          <Input
            id="name"
            placeholder="Enter the subject..."
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="w-full space-y-2">
          <Label htmlFor="name">Порака</Label>
          <Input
            id="name"
            multiline
            rows="4"
            cols="50"
            placeholder="Enter your message..."
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={() => sendMessage()}>Испрати Порака</Button>
      </div>
    </div>
  );
};

export default SupportPage;

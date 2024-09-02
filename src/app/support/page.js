"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Title } from "../_components/ReusableDivs";
import withAuth from "@/src/Components/AuthHoc";

const SupportPage = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const sendMessage = () => {
    // console.log(subject, message);
    // sendMessageApi(subject, message)
  };
  return (
    <div className="flex h-screen items-center justify-center bg-lightGrey">
      <div className=" flex w-full max-w-[480px] flex-col items-center justify-center gap-4 rounded-lg bg-white p-8">
        <div className="text-[35px] font-bold">Пријави проблем</div>
        <div className="w-full space-y-2">
          <Label htmlFor="name">Наслов</Label>
          <Input
            id="name"
            placeholder="Внесете го насловот"
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
            placeholder="Внесе ја пораката"
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          className="w-full bg-darkGrey hover:bg-darkGrey"
          onClick={() => sendMessage()}
        >
          Испрати
        </Button>
      </div>
    </div>
  );
};

export default withAuth(SupportPage);

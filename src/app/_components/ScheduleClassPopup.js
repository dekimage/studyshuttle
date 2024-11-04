import React, { useState } from "react";
import MobxStore from "../mobx";
import {
  OddDropdown,
  SUBJECTS,
  SubjectDropdown,
  filterSubjectsByIds,
} from "@/src/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ScheduleClassPopup = ({
  selectedDate,
  timeRange,
  professor,
  onClose,
}) => {
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [classType, setClassType] = useState("");
  const [notes, setNotes] = useState("");

  const user = MobxStore.user;

  const handleSubmit = async () => {
    if (!subject || !classType) {
      console.log("Please fill in all required fields.");
      return;
    }

    const result = await MobxStore.createEvent({
      date: selectedDate,
      timeRange,
      userId: MobxStore.user.uid,
      professorId: professor.id,
      subject,
      classType,
      notes,
    });

    if (result.success) {
      console.log("Class scheduled successfully");
      onClose(); // Close the popup after successful scheduling
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } else {
      console.log(result.error);
    }
  };

  const maxCharacters = 500;
  const handleNotesChange = (e) => {
    const input = e.target.value;
    if (input.length <= maxCharacters) {
      setNotes(input);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-50">
      <div className="w-1/3 rounded border-4 border-sky bg-white p-5 shadow-lg">
        <div className="mb-4">
          <label className="mb-2 flex font-semibold">Одбери предмет</label>
          <SubjectDropdown
            onChange={(e) => setSubject(e.target.value)}
            selectedSubject={subject}
            subjects={filterSubjectsByIds(professor.subjects)}
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 flex font-semibold">
            Селектирај ја годината на образование
          </label>
          <OddDropdown
            academicLevel={user.academicLevel}
            onChange={(e) => setClassType(e.target.value)}
            selectedSubject={classType}
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 flex font-semibold">
            {" "}
            Што би сакале да работиме на часот?
          </label>
          <div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              className="w-full rounded border p-2"
              placeholder=""
            />
            <div className="text-right text-sm text-gray-500">
              {notes.length}/{maxCharacters}
            </div>
          </div>
        </div>
        {user.yellowTokens <= 0 && (
          <div className="mb-4">
            <div className="mb-2 text-sm text-red-500">
              Немате доволно жолти жетони за да го закажете часот.
            </div>
            <Link href="/profile">
              <div className="text-blue-500 underline">Надополнете токени</div>
            </Link>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Откажи ги промените
          </Button>
          <Button
            disabled={!subject || !classType || user.yellowTokens <= 0}
            onClick={() => {
              if (user.yellowTokens <= 0) {
                return;
              }
              handleSubmit();
            }}
            className="rounded bg-sky px-4 py-2 text-white hover:bg-sky"
          >
            Зачувај и закажи
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleClassPopup;

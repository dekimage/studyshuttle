import React, { useState } from "react";
import MobxStore from "../mobx";
import {
  OddDropdown,
  SubjectDropdown,
  filterSubjectsByIds,
} from "@/src/constants";

const ScheduleClassPopup = ({
  selectedDate,
  timeRange,
  professor,
  onClose,
}) => {
  const [subject, setSubject] = useState("");
  const [classType, setClassType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!subject || !classType) {
      console.error("Please fill in all required fields.");
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
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Откажи ги промените
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-sky px-4 py-2 text-white hover:bg-sky"
          >
            Зачувај и закажи
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleClassPopup;

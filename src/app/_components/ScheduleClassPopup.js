import React, { useState } from "react";
import MobxStore from "../mobx";

const ScheduleClassPopup = ({
  selectedDate,
  timeRange,
  professorId,
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
      professorId,
      subject,
      classType,
      notes,
    });

    if (result.success) {
      console.log("Class scheduled successfully");
      onClose(); // Close the popup after successful scheduling
    } else {
      console.log(result.error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 rounded bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">Schedule a Class</h2>
        <div className="mb-4">
          <label className="mb-2 block font-semibold">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter subject"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block font-semibold">Class Type</label>
          <input
            type="text"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter class type"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block font-semibold">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Additional notes"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleClassPopup;

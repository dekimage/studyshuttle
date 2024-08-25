import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import { FileWarning } from "lucide-react";
import Loader from "./Loader";

const Event = observer(({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState({
    attention: event.scores?.attention || 0,
    memory: event.scores?.memory || 0,
    skill: event.scores?.skill || 0,
    interest: event.scores?.interest || 0,
  });
  const [comment, setComment] = useState(event.comment || "");

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleScoreChange = (key, value) => {
    setScores({ ...scores, [key]: value });
  };

  const handleSave = async () => {
    const updatedEvent = {
      ...event,
      scores,
      comment,
    };

    const result = await MobxStore.updateEventAndSubjectScores(updatedEvent);

    if (result.success) {
      console.log("Event and user scores updated successfully");
      setIsOpen(false);
    } else {
      console.error(result.error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const calculateAverage = () => {
    const total =
      scores.attention + scores.memory + scores.skill + scores.interest;
    return (total / 4).toFixed(2);
  };

  const isNotGraded = Object.values(scores).some((score) => score === 0);

  return (
    <div className="mb-4 flex flex-col rounded-lg border p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-blue-700">{event.subject}</div>
          <div className="text-sm text-gray-500">{event.classType}</div>
          <div className="text-sm text-gray-700">User ID: {event.userId}</div>
        </div>
        <div className="flex items-center">
          {isNotGraded && (
            <div className="flex items-center text-red-600">
              <FileWarning className="mr-1 h-5 w-5" />
              <span>Not Graded</span>
            </div>
          )}
          <button
            onClick={toggleOpen}
            className="ml-3 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            {isOpen ? "CLOSE" : "OPEN"}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold">Date:</label>
              <div className="rounded bg-gray-100 p-2">{event.date}</div>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold">Time Range:</label>
              <div className="rounded bg-gray-100 p-2">
                {event.timeRange.from} - {event.timeRange.to}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold">User Submitted:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">Subject:</label>
                <div className="rounded bg-gray-100 p-2">{event.subject}</div>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">Class Type:</label>
                <div className="rounded bg-gray-100 p-2">{event.classType}</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold">Notes:</label>
              <div className="rounded bg-gray-100 p-2">
                {event.notes || "No notes provided"}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold">Grading:</h3>
            <div className="grid grid-cols-4 gap-4">
              {["attention", "memory", "skill", "interest"].map((stat) => (
                <div key={stat} className="flex flex-col">
                  <label className="font-semibold capitalize">{stat}:</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={scores[stat]}
                    onChange={(e) =>
                      handleScoreChange(stat, parseInt(e.target.value, 10))
                    }
                    className="rounded border px-3 py-2"
                  />
                </div>
              ))}
              <div className="flex flex-col">
                <label className="font-semibold">Average:</label>
                <input
                  type="number"
                  value={calculateAverage()}
                  readOnly
                  className="rounded border bg-gray-100 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold">Comment (0/140):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={140}
                className="w-full rounded border px-3 py-2"
              ></textarea>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const EventList = observer(() => {
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchEvents = async () => {
      await MobxStore.userReady; // Wait for userReady to resolve

      if (MobxStore.user && MobxStore.user.role === "professor") {
        const result = await MobxStore.fetchEventsForProfessor(
          MobxStore.user.professorId,
        );

        if (!result.success) {
          console.log(result.error);
        }
      }

      setLoading(false); // Set loading to false once data is fetched
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <Loader />; 
  }

  return (
    <div className="p-5">
      <h2 className="mb-5 text-2xl font-bold">Scheduled Events</h2>
      <div>
        {MobxStore.events?.length > 0 ? (
          MobxStore.events.map((event) => (
            <Event key={event.id} event={event} />
          ))
        ) : (
          <div>No events scheduled.</div>
        )}
      </div>
    </div>
  );
});

export default EventList;

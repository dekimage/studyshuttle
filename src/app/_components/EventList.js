import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import { ChevronDown, ChevronUp, FileWarning } from "lucide-react";
import Loader from "./Loader";
import { toJS } from "mobx";
import { filterAndSortEvents } from "../pocetna/page";
import { Button } from "@/components/ui/button";
import { filterOddByIds, filterSubjectsByIds } from "@/src/constants";

const Event = observer(({ event, showGraded, ignored = false }) => {
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

  if (showGraded && !isNotGraded && !ignored) return null;

  return (
    <div className="mb-4 flex flex-col rounded-lg border p-4 shadow-lg">
      <div
        onClick={toggleOpen}
        className="flex cursor-pointer items-center justify-between"
      >
        <div>
          <div className="text-xl font-bold text-blue-700">{event.subject}</div>
          <div className="text-sm text-gray-500">{event.classType}</div>
          <div className="break-all text-sm text-gray-700">
            User ID: {event.userId}
          </div>
        </div>
        <div className="flex items-center">
          {isNotGraded && (
            <div className="mr-4 flex items-center text-red-600">
              <FileWarning className="mr-1 h-5 w-5" />
              <span>Нема Оценка</span>
            </div>
          )}
          {isOpen ? <ChevronUp /> : <ChevronDown />}
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
            <h3 className="mb-4 text-lg font-semibold">Од ученикот:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">Предмет:</label>
                <div className="rounded bg-gray-100 p-2">
                  {filterSubjectsByIds([event.subject])[0]?.label}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">Ниво:</label>
                <div className="rounded bg-gray-100 p-2">
                  {filterOddByIds(event.classType).label}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold">Забелешки:</label>
              <div className="rounded bg-gray-100 p-2">
                {event.notes || "No notes provided"}
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-4 text-lg font-semibold">Оценување:</h3>
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
                <label className="font-semibold">Просек:</label>
                <input
                  type="number"
                  value={calculateAverage()}
                  readOnly
                  className="rounded border bg-gray-100 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold">
                Коментар ({comment.length}/140):
              </label>
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
                Откажи
              </button>
              <button
                onClick={handleSave}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Зачувај
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
  const [showGraded, setShowGraded] = useState(true);

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
    <div className="">
      <h2 className="mb-5 text-2xl font-bold">Закажани Следни Настани</h2>
      <div>
        {filterAndSortEvents(toJS(MobxStore.events)).length > 0 ? (
          filterAndSortEvents(toJS(MobxStore.events)).map((event) => (
            <Event key={event.id} event={event} ignored />
          ))
        ) : (
          <div>No events scheduled.</div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {" "}
        <h2 className="mb-5 mt-8 text-2xl font-bold">Сите Настани</h2>
        <Button variant="outline" onClick={() => setShowGraded(!showGraded)}>
          {showGraded ? "Покажи ги сите" : "Покажи само неоценети"}
        </Button>
      </div>

      <div>
        {MobxStore.events?.length > 0 ? (
          MobxStore.events.map((event) => (
            <Event key={event.id} event={event} showGraded={showGraded} />
          ))
        ) : (
          <div>No events scheduled.</div>
        )}
      </div>
    </div>
  );
});

export default EventList;

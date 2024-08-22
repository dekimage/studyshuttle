"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";

const CalendarView = observer(() => {
  const [viewMode, setViewMode] = useState("week"); // "week" or "month"
  const [currentWeek, setCurrentWeek] = useState(new Date()); // The start date of the current week
  const [currentMonth, setCurrentMonth] = useState(new Date()); // The current month
  const [selectedEvent, setSelectedEvent] = useState(null); // For modal display

  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady;
      await MobxStore.fetchUpcomingEventsForUser();
      await MobxStore.fetchAcademyGroupsForUser(); // Fetch Academy Groups
    };

    fetchData();
  }, []);

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const renderWeekView = () => {
    const startOfWeek = new Date(currentWeek);
    const currentDay = startOfWeek.getDay();
    const offset = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + offset);

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={handlePrevWeek}>&lt; Previous Week</button>
          <div>
            {startOfWeek.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
            {" - "}
            {daysOfWeek[6].toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button onClick={handleNextWeek}>Next Week &gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="rounded border p-4">
              <div className="font-bold">{dayNames[day.getDay()]}</div>
              <div className="mt-1">{day.getDate()}</div>
              <div className="mt-2">
                {/* Render events */}
                {MobxStore.upcomingEvents
                  .filter(
                    (event) => event.date === day.toISOString().split("T")[0],
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="mt-2 cursor-pointer rounded bg-blue-200 p-2"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div>{event.subject}</div>
                      <div>
                        {event.timeRange.from} - {event.timeRange.to}
                      </div>
                    </div>
                  ))}
                {/* Render Academy Groups */}
                {MobxStore.academyGroups
                  .filter((group) =>
                    group.schedule.some(
                      (schedule) => schedule.day === dayNames[day.getDay()],
                    ),
                  )
                  .map((group) =>
                    group.schedule
                      .filter(
                        (schedule) => schedule.day === dayNames[day.getDay()],
                      )
                      .map((schedule, i) => (
                        <div
                          key={`${group.id}-${i}`}
                          onClick={() => setSelectedEvent(group)}
                          className="mt-2 cursor-pointer rounded bg-red-200 p-2"
                        >
                          <div>{group.name}</div>
                          <div>
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                      )),
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const startDayOffset =
      startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
    startOfMonth.setDate(startOfMonth.getDate() - startDayOffset);

    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );
    const daysInMonth = Array.from(
      { length: endOfMonth.getDate() + startDayOffset },
      (_, i) => {
        const day = new Date(startOfMonth);
        day.setDate(startOfMonth.getDate() + i);
        return day;
      },
    );

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={handlePrevMonth}>&lt; Previous Month</button>
          <div>
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button onClick={handleNextMonth}>Next Month &gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-4 text-center font-bold">
          {dayNames.map((dayName, index) => (
            <div key={index}>{dayName}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4">
          {daysInMonth.map((day, index) => (
            <div key={index} className="rounded border p-4">
              <div className="font-bold">{day.getDate()}</div>
              <div className="mt-2">
                {/* Render events */}
                {MobxStore.upcomingEvents
                  .filter(
                    (event) => event.date === day.toISOString().split("T")[0],
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className="mt-2 cursor-pointer rounded bg-blue-200 p-2"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div>{event.subject}</div>
                      <div>
                        {event.timeRange.from} - {event.timeRange.to}
                      </div>
                    </div>
                  ))}
                {/* Render Academy Groups */}
                {MobxStore.academyGroups
                  .filter((group) =>
                    group.schedule.some(
                      (schedule) => schedule.day === dayNames[day.getDay()],
                    ),
                  )
                  .map((group) =>
                    group.schedule
                      .filter(
                        (schedule) => schedule.day === dayNames[day.getDay()],
                      )
                      .map((schedule, i) => (
                        <div
                          key={`${group.id}-${i}`}
                          className="mt-2 cursor-pointer rounded bg-red-200 p-2"
                          onClick={() => setSelectedEvent(group)}
                        >
                          <div>{group.name}</div>
                          <div>
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>
                      )),
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!selectedEvent) return null;

    const isEvent = !selectedEvent.schedule;

    return (
      <div
        id="modal-backdrop"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => setSelectedEvent(null)}
      >
        <div
          className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
        >
          {isEvent ? (
            <>
              <h3 className="mb-4 text-2xl font-bold">
                {selectedEvent.subject}
              </h3>
              <p>
                <strong>Class Type:</strong> {selectedEvent.classType}
              </p>
              <p>
                <strong>Professor:</strong>{" "}
                {selectedEvent.professorName || "Unknown"}
              </p>
              <p>
                <strong>Date:</strong> {selectedEvent.date}
              </p>
              <p>
                <strong>Time Range:</strong> {selectedEvent.timeRange.from} -{" "}
                {selectedEvent.timeRange.to}
              </p>
              <p>
                <strong>Notes:</strong>{" "}
                {selectedEvent.notes || "No additional notes"}
              </p>
              <p>
                <strong>Participants:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>{selectedEvent.participantName}</li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="mb-4 text-2xl font-bold">{selectedEvent.name}</h3>
              <p>
                <strong>Subject:</strong> {selectedEvent.subject}
              </p>
              <p>
                <strong>Student Type:</strong> {selectedEvent.studentType}
              </p>
              <p>
                <strong>Professor ID:</strong> {selectedEvent.professorId}
              </p>

              <p>
                <strong>Max Users:</strong> {selectedEvent.maxUsers}
              </p>
              <p>
                <strong>Active Users:</strong> {selectedEvent.activeUsers}
              </p>
              <p>
                <strong>Schedule:</strong>
              </p>
              <ul className="list-disc pl-5">
                {selectedEvent.schedule.map((schedule, index) => (
                  <li key={index}>
                    {schedule.day}: {schedule.startTime} - {schedule.endTime}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Participants:</strong>
              </p>
              <ul className="list-disc pl-5">
                {selectedEvent.userNames.map((userId, index) => (
                  <li key={index}>{userId}</li>
                ))}
              </ul>
            </>
          )}
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-3xl font-bold">Event Calendar</h2>
      <div className="mb-4">
        <button
          onClick={() => setViewMode("week")}
          className={`mr-4 ${viewMode === "week" ? "font-bold underline" : ""}`}
        >
          Week View
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`${viewMode === "month" ? "font-bold underline" : ""}`}
        >
          Month View
        </button>
      </div>
      {viewMode === "week" ? renderWeekView() : renderMonthView()}
      {renderModal()}
    </div>
  );
});

export default CalendarView;

"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

import logoImg from "../../assets/logo.png";
import Image from "next/image";
import { AcademyGroupModal } from "../pocetna/page";
import withAuth from "@/src/Components/AuthHoc";
import { toJS } from "mobx";

const isWithinOneYearRange = (startDate, itemDate) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);

  return itemDate >= start && itemDate <= end;
};

const CalendarView = observer(() => {
  const [viewMode, setViewMode] = useState("week"); // "week" or "month"
  const [currentWeek, setCurrentWeek] = useState(new Date()); // The start date of the current week
  const [currentMonth, setCurrentMonth] = useState(new Date()); // The current month
  const [selectedEvent, setSelectedEvent] = useState(null); // For modal display
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await MobxStore.userReady; // Wait for user to be ready

        // Fetch both events and academy groups
        await Promise.all([
          MobxStore.fetchUpcomingEventsForUser(),
          MobxStore.fetchAcademyGroupsForUser(),
        ]);

        console.log("Fetched academy groups:", toJS(MobxStore.academyGroups));
        console.log("Fetched upcoming events:", toJS(MobxStore.upcomingEvents));
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
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
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const currentDay = startOfWeek.getDay();
    const offset = currentDay === 0 ? -6 : 1 - currentDay;
    startOfWeek.setDate(startOfWeek.getDate() + offset);

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    const formatWeekRange = (date) => {
      // Get the current day of the week (0 is Sunday, 1 is Monday, etc.)
      const currentDay = date.getDay();

      // Calculate the offset to Monday (1) from the current day
      const offset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust if it's Sunday

      // Get the start (Monday) of the week
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() + offset);

      // Get the end (Sunday) of the week
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Format the dates
      const formatDateWithSuffix = (d) => {
        const day = d.getDate();
        const suffix =
          day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
              ? "nd"
              : day % 10 === 3 && day !== 13
                ? "rd"
                : "th";
        return `${day}${suffix}`;
      };

      const monthName = startOfWeek.toLocaleString("default", {
        month: "long",
      });
      const year = startOfWeek.getFullYear();

      return `${formatDateWithSuffix(startOfWeek)} - ${formatDateWithSuffix(
        endOfWeek,
      )} ${monthName} ${year}`;
    };
    return (
      <div>
        <div className="mb-4 flex  items-center justify-center gap-3">
          <Button onClick={handlePrevWeek}>
            <ArrowLeft />
          </Button>
          <div>{formatWeekRange(currentWeek)}</div>
          <Button onClick={handleNextWeek}>
            <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* grid grid-cols-7  */}
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-[150px] rounded border bg-white p-4">
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
                    group.schedule?.some((schedule) =>
                      isWithinOneYearRange(group.startDate, day),
                    ),
                  )
                  .map((group) =>
                    group.schedule
                      ?.filter(
                        (schedule) =>
                          schedule.day.toLowerCase() ===
                          dayNames[day.getDay()].toLowerCase(),
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
        <div className="mb-4 flex items-center justify-center gap-3">
          <Button onClick={handlePrevMonth}>
            <ArrowLeft />
          </Button>
          <div>
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <Button onClick={handleNextMonth}>
            <ArrowRight />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[600px] grid-cols-7 gap-1 text-center font-bold lg:gap-4">
            {dayNames.map((dayName, index) => (
              <div key={index} className="hidden lg:block">
                {dayName}
              </div>
            ))}
          </div>
          <div className="grid min-w-[600px] grid-cols-7 gap-1 lg:gap-4">
            {daysInMonth.map((day, index) => (
              <div key={index} className="rounded border bg-white p-4">
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
                        className="mt-2 cursor-pointer rounded bg-blue-200 p-2 text-xs md:text-base lg:text-sm"
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
                      group.schedule?.some((schedule) =>
                        isWithinOneYearRange(group.startDate, day),
                      ),
                    )
                    .map((group) =>
                      group.schedule
                        ?.filter(
                          (schedule) =>
                            schedule.day.toLowerCase() ===
                            dayNames[day.getDay()].toLowerCase(),
                        )
                        .map((schedule, i) => (
                          <div
                            key={`${group.id}-${i}`}
                            className="mt-2 cursor-pointer rounded bg-red-200 p-2 text-xs md:text-base lg:text-sm"
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
          className="w-full max-w-lg rounded-lg bg-white p-2 shadow-lg lg:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {!isEvent && (
            <AcademyGroupModal
              selectedGroup={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          )}

          {isEvent && (
            <AcademyGroupModal
              selectedGroup={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              isEvent
            />
          )}

          {/* Close button */}
          <Button
            onClick={() => setSelectedEvent(null)}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or your custom loader component
  }

  return (
    <div className="h-full min-h-screen bg-lightGrey p-2 lg:p-6">
      <div className="flex w-full justify-between">
        <h2 className="mb-6 text-3xl font-bold"></h2>
        <Image src={logoImg} alt="logo" width={200} height={200} />
      </div>
      <div className="mb-4">
        <Button
          onClick={() => setViewMode("week")}
          className={`hover:bg-300 mr-4 bg-red-300 ${
            viewMode === "week" ? "bg-chili hover:bg-chili" : ""
          }`}
        >
          Недела
        </Button>
        <Button
          onClick={() => setViewMode("month")}
          className={`hover:bg-300 mr-4 bg-red-300 ${
            viewMode === "month" ? "bg-chili hover:bg-chili" : ""
          }`}
        >
          Месец
        </Button>
      </div>
      {viewMode === "week" ? renderWeekView() : renderMonthView()}
      {renderModal()}
    </div>
  );
});

export default withAuth(CalendarView);

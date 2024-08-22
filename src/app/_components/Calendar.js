import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import ScheduleClassPopup from "./ScheduleClassPopup";

const Calendar = observer(({ schedule }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  const handleScheduleClick = (timeRange) => {
    setSelectedTimeRange(timeRange);
    setIsPopupOpen(true);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null); // Clear selection when navigating months
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null); // Clear selection when navigating months
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-3 text-center"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0",
      )}-${String(i).padStart(2, "0")}`;
      const isAvailable = schedule?.some((scheduleEntry) => {
        return scheduleEntry.date === dateString;
      });

      days.push(
        <div
          key={i}
          className={`cursor-pointer border p-3 text-center ${
            isAvailable ? "bg-blue-400" : "bg-white"
          } hover:bg-blue-100`}
          onClick={() => handleDateClick(dateString)}
        >
          {i}
        </div>,
      );
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderTimeRanges = () => {
    if (!selectedDate)
      return <div>Select a date to see available time ranges</div>;

    const selectedSchedule = MobxStore.user?.schedule?.find(
      (scheduleEntry) => scheduleEntry.date === selectedDate,
    );

    if (!selectedSchedule)
      return <div>No available time ranges for this date</div>;

    const handleDeleteTimeRange = async (timeRange) => {
      const result = await MobxStore.deleteTimeRange(selectedDate, timeRange);
      if (result.success) {
        console.log(
          `Time range ${timeRange.from} - ${timeRange.to} deleted successfully`,
        );
      } else {
        console.error(result.error);
      }
    };

    return (
      <div>
        {isPopupOpen && (
          <ScheduleClassPopup
            selectedDate={selectedDate}
            timeRange={selectedTimeRange}
            // professorId={professorId}
            professorId={"jBbWCkWcgiDK3tdMnquw"}
            onClose={() => setIsPopupOpen(false)}
          />
        )}
        <h3 className="mb-2 text-lg font-semibold">
          Available time ranges for {selectedDate}
        </h3>
        <ul className="list-disc pl-5">
          {selectedSchedule.timeRanges.map((range, index) => (
            <li key={index} className="my-2 flex items-center justify-between">
              <span>
                {range.from} - {range.to}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleScheduleClick(range)}
                  disabled={range.isScheduled}
                  className={`rounded px-3 py-1 text-white ${
                    range.isScheduled
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {range.isScheduled ? "Full" : "Schedule"}
                </button>
                <button
                  onClick={() => handleDeleteTimeRange(range)}
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  X
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="flex space-x-10">
      <div className="w-2/3">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Previous
          </button>
          <h3 className="text-xl font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-semibold">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        {renderCalendar()}
      </div>
      <div className="w-1/3 rounded bg-white p-5 shadow">
        {renderTimeRanges()}
      </div>
    </div>
  );
});

export default Calendar;

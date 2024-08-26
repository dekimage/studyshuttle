import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import ScheduleClassPopup from "./ScheduleClassPopup";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDayFromDate(dateString) {
  // Split the date string by hyphens and return the last element
  return dateString.split("-")[2];
}

const Calendar = observer(({ schedule, professor, isAdmin = false }) => {
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
    if (!selectedDate) return <div>Одберете датум за повеќе детали</div>;

    const selectedSchedule = professor.schedule?.find(
      (scheduleEntry) => scheduleEntry.date === selectedDate,
    );

    if (!selectedSchedule)
      return <div>No available time ranges for this date</div>;

    const handleDeleteTimeRange = async (timeRange, isScheduled = false) => {
      if (isScheduled) {
        console.log("Time range is already scheduled");
        return;
      }
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
      <div className="relative">
        {isPopupOpen && (
          <ScheduleClassPopup
            selectedDate={selectedDate}
            timeRange={selectedTimeRange}
            professorId={professor.id}
            onClose={() => setIsPopupOpen(false)}
          />
        )}
        <div className="rounded-20px absolute left-[-25px] top-[-45px] h-[50px] w-[50px] border bg-blue-400 p-3 text-center">
          {getDayFromDate(selectedDate)}
        </div>
        <h3 className="mb-2 mt-4 text-lg font-semibold">
          Слободни термини за {selectedDate}
        </h3>
        <ul className="list-disc">
          {selectedSchedule.timeRanges?.map((range, index) => (
            <li key={index} className="my-2 flex items-center justify-between">
              <span>
                {range.from} - {range.to}
              </span>
              <div className="flex space-x-2">
                {MobxStore.user?.role == "student" && (
                  <button
                    onClick={() => handleScheduleClick(range)}
                    disabled={range.isScheduled}
                    className={`rounded px-3 py-1 text-white ${
                      range.isScheduled
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {range.isScheduled ? "Полна" : "Закажи"}
                  </button>
                )}

                {MobxStore.user?.role == "professor" && (
                  <div>{range.isScheduled ? "Закажано" : "Слободно"}</div>
                )}

                {isAdmin && (
                  <button
                    disabled={range.isScheduled}
                    onClick={() =>
                      handleDeleteTimeRange(range, range.isScheduled)
                    }
                    className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                  >
                    Delete Event
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="my-4 flex space-x-10">
      <div className="w-2/3">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div className="flex gap-2">
            {" "}
            <button
              onClick={handlePrevMonth}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              <ChevronRight size={24} />
            </button>
          </div>
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
      <div className="w-1/3 rounded bg-white p-2 shadow">
        {renderTimeRanges()}
      </div>
    </div>
  );
});

export default Calendar;

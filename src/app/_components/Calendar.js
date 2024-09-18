import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import ScheduleClassPopup from "./ScheduleClassPopup";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { TerminiComponent } from "../professor-admin/page";

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
    const today = new Date(); // Current date and time
    const currentDateString = today.toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    const days = [];

    // Render empty slots for days before the first day of the current month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-3 text-center"></div>);
    }

    // Render each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0",
      )}-${String(i).padStart(2, "0")}`;

      const isAvailable = schedule?.some((scheduleEntry) => {
        return scheduleEntry.date === dateString;
      });

      // Check if the date is in the past
      const isPast = new Date(dateString) < today;

      days.push(
        <div
          key={i}
          className={`cursor-pointer border p-3 text-center ${
            isPast && isAvailable
              ? "bg-gray-200"
              : isAvailable
                ? "bg-sky"
                : "bg-white"
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

    if (!selectedSchedule) return <div>Нема слободни термини на тој датум</div>;
    // if (!selectedSchedule) {
    //   if (
    //     MobxStore.user?.role === "professor" &&
    //     MobxStore.user?.uid === professor?.uid
    //   ) {
    //     return (
    //       <Dialog>
    //         <DialogTrigger>
    //           <button className="rounded bg-sky px-3 py-1 text-white">
    //             Додади слободен термин
    //           </button>
    //         </DialogTrigger>
    //         <DialogContent>
    //           <TerminiComponent />
    //         </DialogContent>
    //       </Dialog>
    //     );
    //   }
    //   return <div>Нема слободни термини на тој датум</div>;
    // }

    const handleDeleteTimeRange = async (timeRange, isScheduled = false) => {
      if (isScheduled) {
        console.log("Time range is already scheduled");
        return;
      }
      const result = await MobxStore.deleteScheduleEntry(
        selectedDate,
        timeRange,
      );
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
            professor={professor}
            onClose={() => setIsPopupOpen(false)}
          />
        )}
        <div className="rounded-20px absolute left-[-25px] top-[-45px] h-[50px] w-[50px] border bg-sky p-3 text-center">
          {getDayFromDate(selectedDate)}
        </div>
        <h3 className="mb-2 mt-4 text-lg font-semibold">
          Слободни термини за {selectedDate}
        </h3>
        <ul className="list-disc">
          {selectedSchedule.timeRanges?.map((range, index) => {
            // Check if the time range is in the past
            const currentDateTime = new Date();
            const rangeEndDateTime = new Date(`${selectedDate}T${range.to}`);

            const isPast = rangeEndDateTime < currentDateTime;

            let buttonText;
            if (isPast) {
              buttonText = range.isScheduled
                ? "Полна завршена"
                : "Слободна завршена";
            } else {
              buttonText = range.isScheduled ? "Полна" : "Закажи";
            }

            return (
              <li
                key={index}
                className="my-2 flex items-center justify-between"
              >
                <span>
                  {range.from} - {range.to}
                </span>
                <div className="flex items-center space-x-2">
                  {MobxStore.user?.role === "student" && (
                    <button
                      onClick={() => handleScheduleClick(range)}
                      disabled={range.isScheduled || isPast}
                      className={`rounded px-3 py-1 text-white ${
                        isPast
                          ? "cursor-not-allowed bg-gray-300"
                          : range.isScheduled
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-sky hover:bg-sky"
                      }`}
                    >
                      {buttonText}
                    </button>
                  )}

                  {MobxStore.user?.role === "professor" && (
                    <div>{range.isScheduled ? "Закажано" : "Слободно"}</div>
                  )}

                  {isAdmin && (
                    <button
                      disabled={range.isScheduled}
                      onClick={() =>
                        handleDeleteTimeRange(range, range.isScheduled)
                      }
                      className={`rounded  px-3 py-1 text-white  ${
                        range.isScheduled
                          ? "bg-gray-400 hover:bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      Избриши настан
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="my-4 flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-10 md:space-y-0">
      <div className="w-full md:w-2/3">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div className="flex gap-2">
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
      <div className="w-full rounded bg-white p-2 shadow md:w-1/3">
        {renderTimeRanges()}
      </div>
    </div>
  );
});

export default Calendar;

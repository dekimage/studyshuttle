const dummySchedule = [
  { day: "Понеделник", time: "9:00am", title: "Class 1" },
  { day: "Понеделник", time: "10:00am", title: "Class 2" },
  { day: "Понеделник", time: "11:00am", title: "Class 3" },
  { day: "Вторник", time: "10:00am", title: "Class 4" },
  { day: "Вторник", time: "1:00pm", title: "Class 5" },
  { day: "Среда", time: "12:00pm", title: "Class 6" },
  { day: "Среда", time: "3:00pm", title: "Class 7" },
  { day: "Четврток", time: "9:00am", title: "Class 8" },
  { day: "Четврток", time: "16:00pm", title: "Class 9" },
  { day: "Петок", time: "14:00am", title: "Class 9" },
];
const daysOfWeek = [
  "Понеделник",
  "Вторник",
  "Среда",
  "Четврток",
  "Петок",
  "Сабота",
  "Недела",
];

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Title } from "../_components/ReusableDivs";

const DateNavigator = () => {
  return (
    <div className="mb-6 flex w-full items-center justify-between border p-4">
      <Button className="rounded bg-gray-200 p-2">
        <ChevronLeft />
      </Button>
      <div className="text-2xl">22.01.24 - 28.01.24</div>
      <Button className="rounded bg-gray-200 p-2">
        <ChevronRight />
      </Button>
    </div>
  );
};

const DayCard = ({ day, date, classes }) => {
  return (
    <div className=" flex h-[500px] flex-col overflow-hidden border p-4">
      <div className="mb-4 flex flex-col items-center justify-between">
        <h2 className="text-lg font-bold">{day}</h2>
        <p>{date}</p>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto">
        {classes.length === 0 && (
          <p className="text-gray-400">Немате закажано час</p>
        )}
        {classes.map((classItem, index) => (
          <div key={index} className="border p-2">
            <p>
              {classItem.time} - {classItem.title}
            </p>
            <Button className="mt-2">Детали</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const renderScheduleForDay = (day) => {
    const classes = dummySchedule.filter((classItem) => classItem.day === day);
    const date = "21.04.2024";
    return <DayCard day={day} date={date} classes={classes} />;
  };

  return (
    <div className="flex w-full flex-wrap justify-start">
      <Title>Распоред</Title>
      <DateNavigator />
      <Carousel
        opts={{
          align: "start",
        }}
        className="mx-auto w-[90%]"
      >
        <CarouselContent>
          {daysOfWeek.map((day, i) => (
            <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
              <div className="" key={day}>
                {renderScheduleForDay(day)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default SchedulePage;

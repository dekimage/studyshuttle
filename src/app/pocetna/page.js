"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import logoImg from "../../assets/logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Loader from "../_components/Loader";
import { filterOddByIds } from "@/src/constants";
import { toJS } from "mobx";
import Link from "next/link";

// utils function to sort and filter events for only future
export function filterAndSortEvents(events) {
  const now = new Date(); // Current date and time
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Two hours before now

  // Convert date and timeRange to actual Date objects for comparison
  const filteredEvents = events.filter((event) => {
    const [fromHours, fromMinutes] = event.timeRange.from.split(":");
    const eventFromTime = new Date(event.date);
    eventFromTime.setHours(fromHours, fromMinutes, 0, 0); // Set hours and minutes

    // Only include events that start from two hours ago to the future
    return eventFromTime >= twoHoursAgo;
  });

  // Sort the events by their 'from' time (most upcoming first)
  const sortedEvents = filteredEvents.sort((a, b) => {
    const [aHours, aMinutes] = a.timeRange.from.split(":");
    const [bHours, bMinutes] = b.timeRange.from.split(":");

    const aDate = new Date(a.date);
    aDate.setHours(aHours, aMinutes, 0, 0); // Set hours and minutes for event A

    const bDate = new Date(b.date);
    bDate.setHours(bHours, bMinutes, 0, 0); // Set hours and minutes for event B

    return aDate - bDate; // Sort ascending by time
  });

  return sortedEvents;
}

export const AcademyGroupModal = ({
  selectedGroup,
  onClose,
  isEvent = false,
}) => {
  const { user } = MobxStore;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex w-full max-w-lg flex-col justify-between gap-2 rounded-lg border-4 border-sky bg-white p-8 shadow-lg sm:min-w-[600px] sm:flex-row">
        <div className="flex w-full flex-col justify-start gap-2 pr-4 sm:gap-4 sm:border-r-4 sm:border-sky">
          {selectedGroup.name && (
            <div className="text-[19px] font-bold sm:text-[29px]">
              {selectedGroup.name}
            </div>
          )}

          {selectedGroup.description && <div>{selectedGroup.description}</div>}

          <div className="my-2">
            <div className="text-[19px] font-bold sm:text-[29px]">Предмет:</div>
            <div className="text-[15px] font-bold sm:text-[19px]">
              {selectedGroup.subject}
            </div>
          </div>
          <div className="my-2">
            <div className="text-[19px] font-bold sm:text-[29px]">
              {user.role == "professor" ? " Студент" : "Професор"}:
            </div>
            <div className="text-[15px] font-bold sm:text-[19px]">
              {user.role == "professor"
                ? selectedGroup.participantName
                : selectedGroup.professorName}
            </div>
          </div>
          {user.role == "professor" && isEvent && (
            <>
              <div className="text-[19px] font-bold sm:text-[29px]">
                Ниво на Ученик:
              </div>
              <div>{filterOddByIds(selectedGroup.classType).label}</div>
            </>
          )}
          {!isEvent && (
            <div className="my-2">
              <div className=" text-[19px] font-bold sm:text-[29px]">
                Статус:
              </div>
              <div className="text-[15px] font-bold sm:text-[19px]">
                {selectedGroup.activeUsers} / {selectedGroup.maxUsers}
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 pl-4 sm:gap-4">
          <div className="text-[19px] font-bold sm:text-[29px]">
            Термини на часови:
          </div>
          {isEvent && <div>{selectedGroup.date}</div>}
          <div>
            {selectedGroup.timeRange?.from} - {selectedGroup.timeRange?.to}
          </div>
          <ul className="mt-2">
            {selectedGroup.schedule?.map((slot, index) => (
              <li
                key={index}
                className="my-2 w-full border-[3px] border-sky p-2"
              >
                {slot.day}: {slot.startTime} - {slot.endTime} часот
              </li>
            ))}
          </ul>

          {user.role == "professor" && isEvent && (
            <div>
              <div className="text-[19px] font-bold sm:text-[29px]">
                Белешка:
              </div>
              <div>{selectedGroup.notes}</div>
            </div>
          )}

          {user.role == "student" && (
            <>
              <div className="text-[19px] font-bold sm:text-[29px]">
                Линк за {isEvent ? "часот:" : "часовите:"}
              </div>
              <div className="flex w-full justify-between border-[3px] border-black p-2">
                {selectedGroup.link && (
                  <div>
                    {" "}
                    {selectedGroup.link.length > 25
                      ? `${selectedGroup.link.slice(0, 25)}...`
                      : selectedGroup.link}
                  </div>
                )}

                <Copy
                  className="cursor-pointer text-sky"
                  onClick={() => {
                    // Copy link to clipboard
                    navigator.clipboard
                      .writeText(selectedGroup.link)
                      .then(() => {
                        alert("Link copied to clipboard!"); // Optional: Provide feedback to the user
                      })
                      .catch((err) => {
                        console.error("Failed to copy: ", err);
                      });
                  }}
                />
              </div>
            </>
          )}
          <Button
            onClick={onClose}
            className="mt-4 rounded-full bg-sky  text-white hover:bg-sky"
          >
            Затвори
          </Button>
        </div>
        {/* {MobxStore.user.role === "professor" && (
        <div className="mt-4">
          <strong>Ученици/Студенти:</strong>
          <ul className="mt-2 list-disc pl-5">
            {selectedGroup.userNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )} */}
      </div>
    </div>
  );
};

const AcademyGroupsPage = observer(() => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady; // Wait for user to be loaded
      const result = await MobxStore.fetchAcademyGroupsForUser();
      if (!result.success) {
        console.log(result.error);
      }
    };

    fetchData();
  }, []);

  const openDetails = (group) => {
    setSelectedGroup(group);
  };

  const closeModal = () => {
    setSelectedGroup(null);
  };

  return (
    <div>
      <div>
        <div className="mt-8 rounded-bl-[0px] rounded-br-[0px] rounded-tl-[15px] rounded-tr-[15px] bg-sky p-4 font-bold text-white">
          Академски групи
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[700px] grid-cols-5 gap-4 border border-[3px] border-sky bg-white p-4 font-bold">
            <div>Име</div>
            <div>Предмет</div>
            <div>Професор</div>
            <div>Статус</div>
            <div>Детали</div>
          </div>
          <div className="min-w-[700px] space-y-2 rounded-bl-[15px] rounded-br-[15px] border border-[3px] border-t-0 border-sky bg-white p-4">
            {MobxStore.academyGroups.length > 0 ? (
              MobxStore.academyGroups.map((group) => (
                <div key={group.id} className="grid grid-cols-5 gap-4 p-2">
                  <div>{group.name}</div>
                  <div>{group.subject}</div>
                  <div>{group.professorName}</div>
                  <div>
                    {group.activeUsers} / {group.maxUsers}
                  </div>
                  <div>
                    <button
                      onClick={() => openDetails(group)}
                      className="rounded-full bg-sky px-3 py-1 text-white"
                    >
                      Види детали
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div>
                Не учествувате во академска група.{" "}
                <Link className="text-blue-400 underline" href="/professors">
                  Побарајте група.
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedGroup && (
        <AcademyGroupModal selectedGroup={selectedGroup} onClose={closeModal} />
      )}
    </div>
  );
});

const OverviewPage = observer(() => {
  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady; // Wait for user to be loaded
      const result = await MobxStore.fetchUpcomingEventsForUser();
      if (!result.success) {
        console.log(result.error);
      }
    };

    fetchData();
  }, []);

  const { user } = MobxStore;

  if (!user) return <Loader />;

  return (
    <div className="bg-lightGrey p-4 sm:p-8">
      <div className="flex justify-between">
        <div className="text-[28px] font-bold  sm:text-[45px]">
          Добредојдовте во <br />{" "}
          <span className="text-sky">Study Shuttle</span>
        </div>
        <div>
          <Image
            src={logoImg}
            alt="logo"
            height={100}
            width="100"
            className="ml-2 mt-2 w-[150px]"
          />
        </div>
      </div>

      <div className="mt-4 text-[15px] sm:text-[19px]">
        На вашата почетна страна можете да ги погледнете своите{" "}
        <span className="font-bold">СЛЕДНИ НАСТАНИ</span> или{" "}
        <span className="font-bold">АКАДЕМСКИ ГРУПИ</span> каде сте претплатени.
      </div>
      <div className="text-[15px] sm:text-[19px]">
        Доколку не сте член на група или немаате настани погледнете ги нашите
        <span className="font-bold text-chili"> ПАКЕТИ</span>.
      </div>

      <div>
        <div className="mt-8 rounded-bl-[0px] rounded-br-[0px] rounded-tl-[15px] rounded-tr-[15px] bg-chili p-4 font-bold text-white">
          Следни настани
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[600px] grid-cols-4 gap-4 border border-[3px] border-chili bg-white p-4 font-bold">
            <div>Датум</div>
            <div>Предмет</div>
            <div>Тип на настан</div>
            <div>{user.role == "professor" ? "Студент" : "Професор"}</div>
          </div>
          <div className="min-w-[600px] space-y-2 rounded-bl-[15px] rounded-br-[15px] border border-[3px] border-t-0 border-chili bg-white p-4">
            {filterAndSortEvents(MobxStore.upcomingEvents).length > 0 ? (
              filterAndSortEvents(MobxStore.upcomingEvents).map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-4 gap-2 rounded p-2 font-bold"
                >
                  <div>{event.date}</div>
                  <div>{event.subject}</div>
                  <div>{event.classType}</div>
                  <div>
                    {user.role == "professor"
                      ? event.participantName
                      : event.professorName}
                  </div>
                </div>
              ))
            ) : (
              <div>
                Нема следни настани.{" "}
                <Link className="text-blue-400 underline" href="/professors">
                  Побарајте термин.
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <AcademyGroupsPage />
    </div>
  );
});

export default OverviewPage;

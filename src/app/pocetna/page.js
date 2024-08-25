"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import logoImg from "../../assets/logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Loader from "../_components/Loader";

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
          <div className="min-w-[700px] space-y-2 rounded-bl-[15px] rounded-br-[15px] border border-[3px] border-t-0 border-sky bg-white p-4 font-bold">
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
              <div>No academy groups found.</div>
            )}
          </div>
        </div>
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex w-full max-w-lg flex-col justify-between gap-2 rounded-lg border-4 border-sky bg-white p-8 shadow-lg sm:flex-row">
            <div className="flex w-full flex-col gap-2 pr-4 sm:gap-4 sm:border-r-4 sm:border-sky">
              <div className="text-[19px] font-bold sm:text-[29px]">
                {selectedGroup.name}
              </div>
              <div>{selectedGroup.description}</div>

              <div className="my-2">
                <div className="text-[19px] font-bold sm:text-[29px]">
                  Предмет:
                </div>
                <div className="text-[15px] font-bold sm:text-[19px]">
                  {selectedGroup.subject}
                </div>
              </div>
              <div className="my-2">
                <div className="text-[19px] font-bold sm:text-[29px]">
                  Професор:
                </div>
                <div className="text-[15px] font-bold sm:text-[19px]">
                  {selectedGroup.professorName}
                </div>
              </div>
              <div className="my-2">
                <div className=" text-[19px] font-bold sm:text-[29px]">
                  Статус:
                </div>
                <div className="text-[15px] font-bold sm:text-[19px]">
                  {selectedGroup.activeUsers} / {selectedGroup.maxUsers}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 pl-4 sm:gap-4">
              <div className="text-[19px] font-bold sm:text-[29px]">
                Термини на часови:
              </div>
              <ul className="mt-2">
                {selectedGroup.schedule.map((slot, index) => (
                  <li
                    key={index}
                    className="my-2 w-full border-[3px] border-sky p-2"
                  >
                    {slot.day}: {slot.startTime} - {slot.endTime} часот
                  </li>
                ))}
              </ul>

              <div className="text-[19px] font-bold sm:text-[29px]">
                Линк за часовите:
              </div>
              <div className="flex w-full justify-between border-[3px] border-black p-2">
                <div>Link....</div>
                <Copy className="cursor-pointer text-sky" />
              </div>
              <Button
                onClick={closeModal}
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
            {MobxStore.upcomingEvents.length > 0 ? (
              MobxStore.upcomingEvents.map((event) => (
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
              <div>No upcoming events.</div>
            )}
          </div>
        </div>
      </div>

      <AcademyGroupsPage />
    </div>
  );
});

export default OverviewPage;

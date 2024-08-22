"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";

const AcademyGroupsPage = observer(() => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady; // Wait for user to be loaded
      const result = await MobxStore.fetchAcademyGroupsForUser();
      if (!result.success) {
        console.error(result.error);
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
    <div className="p-6">
      <h2 className="mb-6 text-3xl font-bold">My Academy Groups</h2>
      <div className="mb-2 grid grid-cols-5 gap-4 font-semibold">
        <div>Name</div>
        <div>Subject</div>
        <div>Professor</div>
        <div>Status</div>
        <div>Details</div>
      </div>
      <div className="space-y-4">
        {MobxStore.academyGroups.length > 0 ? (
          MobxStore.academyGroups.map((group) => (
            <div
              key={group.id}
              className="grid grid-cols-5 gap-4 rounded border p-4 shadow-sm"
            >
              <div>{group.name}</div>
              <div>{group.subject}</div>
              <div>{group.professorName}</div>
              <div>
                {group.activeUsers} / {group.maxUsers} Active
              </div>
              <div>
                <button
                  onClick={() => openDetails(group)}
                  className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                >
                  Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>No academy groups found.</div>
        )}
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-2xl font-bold">{selectedGroup.name}</h3>
            <p>
              <strong>Subject:</strong> {selectedGroup.subject}
            </p>
            <p>
              <strong>Professor:</strong> {selectedGroup.professorName}
            </p>
            <p>
              <strong>Status:</strong> {selectedGroup.activeUsers} /{" "}
              {selectedGroup.maxUsers} Active
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(
                selectedGroup.createdAt.seconds * 1000,
              ).toLocaleDateString()}
            </p>
            <div>
              <strong>Schedule:</strong>
              <ul className="mt-2">
                {selectedGroup.schedule.map((slot, index) => (
                  <li key={index} className="mt-1">
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </li>
                ))}
              </ul>
            </div>
            {MobxStore.user.role === "professor" && (
              <div className="mt-4">
                <strong>Participants:</strong>
                <ul className="mt-2 list-disc pl-5">
                  {selectedGroup.userNames.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={closeModal}
              className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Close
            </button>
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
        console.error(result.error);
      }
    };

    fetchData();
  }, []);

  const { user } = MobxStore;

  if (!user) return <div>Loading..</div>;

  return (
    <div>
      <div className="p-6">
        <h2 className="mb-6 text-3xl font-bold">Upcoming Events</h2>
        <div className="mb-2 grid grid-cols-4 gap-4 font-semibold">
          <div>Date</div>
          <div>Subject</div>
          <div>Event Type</div>
          <div>{user.role == "professor" ? "Student" : "Professor"}</div>
        </div>
        <div className="space-y-4">
          {MobxStore.upcomingEvents.length > 0 ? (
            MobxStore.upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-4 gap-4 rounded border p-4 shadow-sm"
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

      <AcademyGroupsPage />
    </div>
  );
});

export default OverviewPage;

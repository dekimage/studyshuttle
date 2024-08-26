"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";

import Loader from "../_components/Loader";
import { Button } from "@/components/ui/button";
import StarRating from "../_components/StarRating";
import Calendar from "../_components/Calendar";
import Image from "next/image";
import blueTokenImg from "../../assets/bluecoin.png";
import { ChevronLeft } from "lucide-react";

function isAvailableEventInNextXDays(schedule, days) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  // Convert date string to Date object for comparison
  const parseDate = (dateString) => new Date(dateString);

  // Iterate over the schedule array to find any event in the range
  for (const event of schedule) {
    const eventDate = parseDate(event.date);

    if (eventDate >= now && eventDate <= futureDate) {
      // If event date is within the range and has at least one scheduled time range
      if (event.timeRanges.some((timeRange) => timeRange.isScheduled)) {
        return true;
      }
    }
  }

  return false;
}

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex  items-center justify-center  bg-black bg-opacity-50">
      <div className="min-h-[350px] min-w-[250px] rounded-md border-[3px] border-sky bg-white p-4">
        {children}
      </div>
    </div>
  );
};

const AcademyGroups = ({ professor }) => {
  const { user, fetchAcademyGroupsByProfessor, joinGroup } = MobxStore;

  const [academyGroups, setAcademyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [joinGroupId, setJoinGroupId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const result = await fetchAcademyGroupsByProfessor(professor.id);
      if (result.success) {
        setAcademyGroups(result.data);
      } else {
        console.log(result.error);
        setAcademyGroups([]); // Reset if there's an error
      }
    };

    fetchGroups();
  }, [fetchAcademyGroupsByProfessor, professor]);

  const handleJoinGroup = async (groupId) => {
    const result = await joinGroup(groupId);
    if (result.success) {
      console.log("Joined group successfully.");
      // Optionally update local state to reflect the join
    } else {
      console.log("Error joining group:", result.error);
    }
  };

  if (academyGroups.length < 1) {
    return <div>No academy groups found.</div>;
  }

  const statusBorderClass = (activeUsers, maxUsers) => {
    if (activeUsers >= maxUsers) {
      return "border-chili border-2 w-fit rounded-full font-bold px-2 flex items-center justify-center";
    } else if (activeUsers >= 6) {
      return "border-green-400 border-2 w-fit rounded-full font-bold px-2 flex items-center justify-center"; // Replace with your desired class for a group that can start
    } else {
      // There are still available slots
      return "bg-lightGrey border-2 w-fit rounded-full font-bold px-2 flex items-center justify-center"; // Replace with your desired class for available slots
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {academyGroups.length > 0 &&
        academyGroups.map((group) => (
          <div
            key={group.id}
            className="my-4 flex w-full flex-col items-start rounded-lg border border-[3px] border-sky bg-white p-4"
          >
            <div className="flex w-full justify-between">
              <div className="text-lg font-bold">{group.name}</div>
              <div className="flex gap-2 text-xs font-bold">
                Тип на токен кој ви е потребен:{" "}
                <Image
                  src={blueTokenImg}
                  width={40}
                  height={40}
                  alt="blue token"
                />
              </div>
            </div>

            <div className="mt-4 flex w-full items-center justify-between">
              <div className="flex gap-2 text-sm">
                Број на членови:{" "}
                <div
                  className={statusBorderClass(
                    group.activeUsers,
                    group.maxUsers,
                  )}
                >
                  {group.activeUsers}/{group.maxUsers}
                </div>
              </div>
              <div>
                Термини на часови:{" "}
                <Button
                  className="bg-sky text-[14px] hover:bg-sky"
                  onClick={() => setSelectedGroup(group)}
                >
                  Види детали
                </Button>
              </div>
              {user.role == "student" &&
              !(group.activeUsers >= group.maxUsers) ? (
                <Button
                  className="bg-chili text-[18px] text-white hover:bg-chili"
                  onClick={() => setJoinGroupId(group.id)}
                >
                  Одбери
                </Button>
              ) : (
                <div className="bg-lightGrey p-2">Полна</div>
              )}
            </div>

            {/* Schedule Modal */}
            {selectedGroup && selectedGroup.id === group.id && (
              <Modal>
                <h3 className="text-[29px] font-bold">Термини на часови:</h3>
                <div className="flex flex-col">
                  {selectedGroup.schedule.map((sched, idx) => (
                    <div
                      key={idx}
                      className="my-4 flex items-center justify-between rounded border-2 border-sky p-2"
                    >
                      <div>{sched.day}</div>
                      <div>
                        {sched.startTime} - {sched.endTime} часот
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4 w-[100px] rounded-full bg-sky hover:bg-sky"
                  onClick={() => setSelectedGroup(null)}
                >
                  Затвори
                </Button>
              </Modal>
            )}

            {/* Join Group Confirmation Modal */}
            {joinGroupId && joinGroupId === group.id && (
              <Modal onClose={() => setJoinGroupId(null)}>
                <div className="flex h-[300px] w-[300px] flex-col items-center justify-center">
                  {user.blueTokens < 1 ? (
                    <div>
                      Имате 0{" "}
                      <Image
                        src={blueTokenImg}
                        height={40}
                        width={40}
                        alt="blue token"
                      />
                      сини токени на сметка.
                      <Link className="/profile">
                        <Button className="bg-sky hover:bg-sky">
                          Надополнете тука
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="text-[20px] font-bold">
                        Дали сте сигурни дека сакате да ја одберете оваа
                        академска група?
                      </div>
                      <div className="mt-8 flex gap-4">
                        <Button
                          className="w-[100px] rounded-full bg-sky hover:bg-sky"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          Да
                        </Button>
                        <Button
                          className="w-[100px] rounded-full"
                          onClick={() => setJoinGroupId(null)}
                        >
                          Затвори
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Modal>
            )}
          </div>
        ))}
    </div>
  );
};

const ProffesorCard = ({
  professor,
  loadProfessor,
  isLanding = false,
  isDetails = false,
  existingReview,
  onReviewSubmit,
  setIsDetails,
}) => {
  const { name, lastname, title, scopes, about, languages, subjects, image } =
    professor;

  const [rating, setRating] = useState(
    existingReview ? existingReview.stars : 0,
  );

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.stars);
    }
  }, [existingReview]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewSubmit = () => {
    if (rating == existingReview?.stars) {
      return;
    }
    onReviewSubmit(rating);
  };

  const isFreeEventsIn30Days = isAvailableEventInNextXDays(
    professor.schedule,
    30,
  );

  return (
    <div
      style={isDetails ? { width: "100%" } : { width: "298px" }}
      className="relative flex max-w-[920px] items-center rounded-[20px] border border-2 border-[3px] border-sun border-sun bg-white text-center"
    >
      <div className="flex  w-[290px] flex-col items-center rounded-[20px]  bg-white px-[12px] py-8 text-center">
        {image && (
          <div
            className={`mb-4 mt-8 flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[3px] ${
              isLanding ? "border-chili" : "border-sun"
            }`}
          >
            <Image
              src={image}
              width={150}
              height={150}
              alt="profesor"
              className="h-[118px] w-[118px] rounded-full object-cover"
            />
          </div>
        )}

        <div className="text-[24px] font-extrabold uppercase">
          {name} {lastname}
        </div>
        <div className="mt-4 text-[20px] font-semibold">{title}</div>

        <div className="text-20px my-4 text-center font-bold">ПРЕДМЕТИ:</div>
        <div className="mx-8 flex w-[160px] flex-col">
          {subjects?.map((subject, index) => (
            <div
              key={index}
              style={{
                boxShadow: "inset 2px 7px 4px -5px rgba(0, 0, 0, 0.49)",
              }}
              className={`my-2 w-full rounded-[10px] bg-sun px-8 py-2 text-[12px] font-bold 
              
            `}
            >
              {subject}
            </div>
          ))}
        </div>

        {!isDetails && (
          <>
            <div>
              <StarRating rating={professor.averageRating || 0} />
            </div>
            <div className="text-20px my-4 text-center font-bold">
              ЈАЗИЦИ НА ПРЕДАВАЊА:
            </div>
            <div className="mx-8 flex w-fit justify-center gap-2 text-xs">
              {languages?.map((language, index) => (
                <div
                  key={index}
                  style={{
                    boxShadow: "inset 2px 7px 4px -5px rgba(0, 0, 0, 0.49)",
                  }}
                  className={`w-fit rounded-full bg-sun px-2 py-1 text-[10px] font-bold`}
                >
                  {language}
                </div>
              ))}
            </div>
          </>
        )}

        {isDetails && (
          <div>
            <div className="text-20px my-4 text-center font-bold">
              За професорот:
            </div>
            <div className="text-xs">{about}</div>

            <div className="text-20px my-4 text-center font-bold">
              Оцени го професорот:
            </div>
            <div className="mb-2 text-xs">
              Кликнете на ѕвездичките за да го оцените професорот: 1 - не
              доволно добро, 5 - одлично.
            </div>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                setRating={handleRatingChange}
                editable={true}
              />
            </div>

            <div className="mt-2">
              <Button onClick={handleReviewSubmit}>
                {existingReview ? "Промени оценка" : "Поднеси оценка"}
              </Button>
            </div>
            <div className="mt-2">
              <Button
                className="bg-darkGrey"
                onClick={() => setIsDetails(false)}
              >
                <ChevronLeft /> Назад
              </Button>
            </div>
          </div>
        )}

        {isLanding && !isDetails && (
          <Button
            onClick={() => loadProfessor(professor)}
            className="mt-4 w-full rounded-[10px] bg-chili hover:bg-chili"
          >
            Види профил
          </Button>
        )}
      </div>

      {isDetails && (
        <div className="flex h-[900px] w-full flex-col justify-between rounded-[16px] bg-sun p-4">
          <div className="h-[450px] pt-4">
            <div className="text-[25px] font-bold">
              Слободни термини за часови:
            </div>

            {isFreeEventsIn30Days ? (
              <Calendar schedule={professor.schedule} professor={professor} />
            ) : (
              <div className="text-gray-400">
                Нема слободни настани во средните 4 недели
              </div>
            )}
          </div>

          <div className="mt-4 h-[450px] border-t-4 border-white pt-4">
            <div className="text-[25px] font-bold">Академски групи:</div>
            <AcademyGroups professor={professor} />
          </div>
        </div>
      )}
    </div>
  );
};

const ProfPage = observer(() => {
  const {
    professors,
    fetchAllProfessors,
    user,
    checkUserReview,
    submitReview,
  } = MobxStore;

  const [profDetails, setProfDetails] = useState(null);
  const [existingReview, setExistingReview] = useState(null); // State for existing review

  const loadProfessor = async (professor) => {
    setProfDetails({ professor });

    if (user) {
      const reviewResult = await checkUserReview(professor.id);
      if (reviewResult.reviewed) {
        setExistingReview(reviewResult.review);
      } else {
        setExistingReview(null);
      }
    }
  };

  const handleReviewSubmit = async (rating) => {
    // Check if we have an existing review
    if (existingReview && existingReview.id) {
      // Update existing review
      const result = await submitReview(
        profDetails.professor.id, // Use the professor ID from profDetails
        rating,
        existingReview.stars,
        existingReview.id,
      );

      if (result.success) {
        console.log("Review updated successfully.");
      } else {
        console.log("Error updating review:", result.error);
      }
    } else {
      // Submit a new review
      const result = await submitReview(
        profDetails.professor.id, // Use the professor ID from profDetails
        rating,
      );
      if (result.success) {
        console.log("Review submitted successfully.");
      } else {
        console.log("Error submitting review:", result.error);
      }
    }
  };

  useEffect(() => {
    const fetchProfessorsData = async () => {
      const result = await fetchAllProfessors();
      if (!result?.success) {
        console.log(result.error);
      }
    };

    fetchProfessorsData();
  }, [fetchAllProfessors]);

  if (professors.length < 1) {
    return <Loader />;
  }

  return (
    <div className="bg-lightGrey px-2 py-4 sm:px-8">
      {profDetails ? (
        <div>
          <ProffesorCard
            key={profDetails.professor?.id}
            professor={profDetails.professor}
            isDetails
            isLanding
            existingReview={existingReview}
            onReviewSubmit={handleReviewSubmit}
            setIsDetails={setProfDetails}
          />
        </div>
      ) : (
        <div>
          <div className="text-[29px] font-bold sm:text-[45px]">Професори</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professors.map((professor) => (
              <ProffesorCard
                key={professor.id}
                professor={professor}
                loadProfessor={loadProfessor}
                isLanding
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfPage;

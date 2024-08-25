"use client";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";

import Loader from "../_components/Loader";
import { Button } from "@/components/ui/button";
import StarRating from "../_components/StarRating";

const ProffesorCard = ({
  professor,
  loadProfessor,
  isLanding = false,
  isDetails = false,
  existingReview,
  onReviewSubmit,
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

  return (
    <div className="flex  items-center rounded-[20px] border border-2 border-[3px] border-sun border-sun bg-white px-[12px] py-8 text-center">
      <div className="flex w-[295px] flex-col items-center rounded-[20px] border border-2 border-[3px] border-sun border-sun bg-white px-[12px] py-8 text-center">
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
          <>
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
          </>
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
      <div className="w-full">tukla novite</div>
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
    console.log("load professor");
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
      const result = await MobxStore.submitReview(
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
      const result = await MobxStore.submitReview(
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

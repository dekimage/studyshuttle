"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import RadarChart from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";
import { Button } from "@/components/ui/button";
import Loader from "../_components/Loader";
import { SUBJECTS, SubjectDropdown } from "@/src/constants";
import withAuth from "@/src/Components/AuthHoc";

const bgColorMap = {
  attention: "bg-sun",
  memory: "bg-sky",
  interest: "bg-chili",
  skill: "bg-darkGrey",
  average: "bg-white",
};

const translationMap = {
  attention: "Внимание",
  memory: "Меморија",
  skill: "Вештина",
  interest: "Интерес",
  average: "Просек",
};

const translateObjectValues = (obj) => {
  const translatedObj = {};

  Object.entries(obj).forEach(([key, value]) => {
    translatedObj[key] = translationMap[value.toLowerCase()] || value;
  });

  return translatedObj;
};

const getTranslatedLabel = (label) => {
  return translationMap[label] || label;
};

const convertToOriginalRating = (normalizedValue) => {
  return (normalizedValue * 5).toFixed(2); // Display up to 2 decimal points
};

const AnalyticsPage = observer(() => {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].id);
  const [chartData, setChartData] = useState([]);
  const [fetchedUserProfile, setFetchedUserProfile] = useState(null); // For professor view
  const [fetchedUserGrades, setFetchedUserGrades] = useState(null); // For professor view
  const [inputUserId, setInputUserId] = useState(""); // For professor view

  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady; // Ensure user is ready before fetching grades

      if (MobxStore.user && MobxStore.user.role === "student") {
        const result = await MobxStore.fetchUserGrades();
        if (!result?.success) {
          console.log(result.error);
        } else {
          calculateChartData(selectedSubject); // Ensure calculation after fetching
        }
      }
    };

    if (MobxStore.user?.role === "student") {
      fetchData();
    }
  }, [MobxStore.userReady, MobxStore.user]);

  const calculateChartData = (subjectId, userGrades = null) => {
    const subjectData = userGrades
      ? userGrades[subjectId] // Use fetched user's grades if available
      : MobxStore.analytics[subjectId];

    if (subjectData) {
      const totalScores = subjectData.totalScores || {
        attention: 0,
        memory: 0,
        skill: 0,
        interest: 0,
      };
      const totalEvents = subjectData.totalEvents || 1; // Prevent division by zero

      // Calculate average per dimension
      const attentionAvg = totalScores.attention / totalEvents / 5;
      const memoryAvg = totalScores.memory / totalEvents / 5;
      const skillAvg = totalScores.skill / totalEvents / 5;
      const interestAvg = totalScores.interest / totalEvents / 5;

      // Calculate the overall average of the four dimensions
      const overallAverage =
        (attentionAvg + memoryAvg + skillAvg + interestAvg) / 4;

      const data = [
        {
          data: {
            attention: attentionAvg, // Normalized average grade
            memory: memoryAvg,
            skill: skillAvg,
            interest: interestAvg,
            average: overallAverage, // 5th dimension: average of the four
          },
          meta: { color: "blue" },
        },
      ];

      setChartData(data);
    } else {
      // No data for this subject, so set an empty chart
      setChartData([
        {
          data: {
            attention: 0,
            memory: 0,
            skill: 0,
            interest: 0,
            average: 0,
          },
          meta: { color: "blue" },
        },
      ]);
    }
  };
  useEffect(() => {
    if (MobxStore.user?.role === "student") {
      calculateChartData(selectedSubject);
    } else if (fetchedUserGrades) {
      calculateChartData(selectedSubject, fetchedUserGrades);
    }
  }, [selectedSubject, fetchedUserGrades, MobxStore.analytics]);

  const handleLoadProfile = async () => {
    try {
      const result = await MobxStore.fetchUserProfileWithGrades(inputUserId);
      if (result.success) {
        setFetchedUserProfile(result.data.userProfile);
        setFetchedUserGrades(result.data.userGrades);
        calculateChartData(selectedSubject, result.data.userGrades); // Load data for the first subject
      } else {
        console.log("Error fetching user profile: ", result.error);
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const captions = {
    attention: "Attention",
    memory: "Memory",
    skill: "Skill",
    interest: "Interest",
    average: "Average",
  };

  const { user } = MobxStore;

  if (!user) return <Loader />;

  return (
    <div className="h-screen bg-lightGrey px-2 md:px-8">
      <h2 className="mb-4 text-[29px] font-bold sm:text-[45px]">Аналитика</h2>

      {user.role === "professor" ? (
        <div className="mb-4 flex flex-col gap-4">
          <input
            type="text"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            placeholder="Внесете UserID"
            className="rounded border px-2 py-1"
          />
          <Button onClick={handleLoadProfile}>Вчитајте Профил</Button>

          {fetchedUserProfile && (
            <>
              <div>
                Showing data for: {fetchedUserProfile.name}{" "}
                {fetchedUserProfile.lastname}
              </div>
              <div className="mb-4 flex max-w-[900px] flex-col items-center gap-8 rounded-[19px] border-2 border-sun bg-white p-8">
                <RadarChart
                  captions={translateObjectValues(captions)}
                  data={chartData}
                  size={350}
                />
                <div className="flex flex-wrap justify-center gap-8">
                  {Object.entries(chartData[0]?.data || {}).map(
                    ([key, value], i) => {
                      const bgColorClass = bgColorMap[key] || "bg-gray-200";

                      return (
                        <div key={i} className="flex items-center space-x-2">
                          <div
                            className={`mr-1 rounded-full border-2 border-black p-2 ${bgColorClass}`}
                          ></div>
                          {getTranslatedLabel(key)}:{" "}
                          {convertToOriginalRating(value)}
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <label className="mr-2">Предмет:</label>
                  <SubjectDropdown
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    selectedSubject={selectedSubject}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // For student role
        <div className="mb-4 flex max-w-[900px] flex-col items-center gap-8 rounded-[19px] border-2 border-sun bg-white p-8">
          <RadarChart
            captions={translateObjectValues(captions)}
            data={chartData}
            size={350}
          />
          <div className="flex flex-wrap justify-center gap-8">
            {Object.entries(chartData[0]?.data || {}).map(([key, value], i) => {
              const bgColorClass = bgColorMap[key] || "bg-gray-200";

              return (
                <div key={i} className="flex items-center space-x-2">
                  <div
                    className={`mr-1 rounded-full border-2 border-black p-2 ${bgColorClass}`}
                  ></div>
                  {getTranslatedLabel(key)}: {convertToOriginalRating(value)}
                </div>
              );
            })}
          </div>

          <div className="flex w-full flex-wrap justify-between gap-4">
            <div>
              <div>
                Студент: {user.name} {user.lastname}
              </div>
              <div>ID: {user.uid}</div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="mr-2">Предмет:</label>
              <SubjectDropdown
                onChange={(e) => setSelectedSubject(e.target.value)}
                selectedSubject={selectedSubject}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default withAuth(AnalyticsPage);

"use client";
import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import MobxStore from "../mobx";
import RadarChart from "react-svg-radar-chart";
import "react-svg-radar-chart/build/css/index.css";

const subjects = [
  { label: "Mathematics", id: "123" },
  { label: "Science", id: "science" },
  { label: "History", id: "history" },
  { label: "Art", id: "art" },
  { label: "Physical Education", id: "pe" },
];

const AnalyticsPage = observer(() => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await MobxStore.userReady; // Ensure user is ready before fetching grades

      if (MobxStore.user) {
        const result = await MobxStore.fetchUserGrades();
        if (!result?.success) {
          console.log(result.error);
        } else {
          // Trigger data calculation after fetching
          calculateChartData(subjects[0].id);
        }
      } else {
        console.log("User data is not available.");
      }
    };

    fetchData();
  }, []);

  const calculateChartData = (subjectId) => {
    const subjectData = MobxStore.analytics[subjectId];

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
    calculateChartData(selectedSubject);
  }, [selectedSubject]);

  const captions = {
    attention: "Attention",
    memory: "Memory",
    skill: "Skill",
    interest: "Interest",
    average: "Average",
  };

  return (
    <div className="p-5">
      <h2 className="mb-4 text-2xl font-bold">Analytics</h2>

      <div className="mb-4">
        <label className="mr-2">Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded border px-2 py-1"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <RadarChart captions={captions} data={chartData} size={450} />
      </div>
    </div>
  );
});

export default AnalyticsPage;

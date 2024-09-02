"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Title } from "../_components/ReusableDivs";
import MobxStore from "@/src/app/mobx";
import { Plus, Trash, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Calendar from "../_components/Calendar";
import { observer } from "mobx-react";
import EventList from "../_components/EventList";
import withAuth from "@/src/Components/AuthHoc";
import withProfAuth from "@/src/Components/AuthProfHoc";
import { SubjectDropdown } from "@/src/constants";

// GPT GENERATED THJAT WORKS WITH MAILGUN
const FeedbackForm = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = {
      subject,
      message,
      user: {
        firstName: "John", // Replace with the actual user's first name
        lastName: "Doe", // Replace with the actual user's last name
      },
    };

    try {
      const response = await fetch("/api/sendFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError("Failed to send message.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Subject</label>
        <Input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Message sent successfully!</p>}
    </form>
  );
};

function AcademyGroupsList({ academyGroups, onEdit, onDelete }) {
  return (
    <div>
      <h2 className="p-2 text-2xl">Академски Групи</h2>
      <div>
        {academyGroups.map((group, i) => (
          <div
            className="m-2 gap-2 rounded border border-4 p-4 "
            key={group.id}
          >
            <div className="mb-4">
              <span className="mr-2 text-2xl">{i + 1}.</span>
              <strong>{group.name}</strong> - {group.subject}
            </div>
            <Button onClick={() => onEdit(group)}>Промени</Button>
            {/* <Button
              className="ml-2 bg-red-400"
              onClick={() => onDelete(group.id)}
            >
              Delete
            </Button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditAcademyGroup({ group, onSave, onCancel }) {
  const [error, setError] = useState("");
  const [name, setName] = useState(group.name);
  const [subject, setSubject] = useState(group.subject);
  const [studentType, setStudentType] = useState(group.studentType);
  const [schedule, setSchedule] = useState(group.schedule);

  useEffect(() => {
    setName(group.name);
    setSubject(group.subject);
    setStudentType(group.studentType);
    setSchedule(group.schedule);
  }, [group]);

  const handleScheduleChange = (index, key, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][key] = value;
    setSchedule(newSchedule);
  };

  const handleAddTimeSlot = () => {
    setSchedule([...schedule, { day: "", startTime: "", endTime: "" }]);
  };

  const handleRemoveTimeSlot = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleSaveUpdates = () => {
    if (!name) {
      setError("Името е задолжително.");
      return;
    }

    // Validation for subject
    if (!subject) {
      setError("Предметот е задолжителен.");
      return;
    }

    // Validation for studentType
    if (studentType.length === 0) {
      setError("Потребно е да изберете барем еден тип на корисник.");
      return;
    }

    // Validation for schedule: Check if all slots are valid
    const allValidTimeSlots = schedule.every(
      (slot) => slot.day !== "" && slot.startTime !== "" && slot.endTime !== "",
    );

    if (!allValidTimeSlots) {
      setError("Сите термини мора да бидат валидни и пополнети.");
      return;
    }

    // Clear errors if validation passes
    setError("");

    // Call onSave with the updated group data
    onSave({
      ...group,
      name,
      subject,
      studentType,
      schedule,
    });
  };

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold">Промени за Академска Група</h2>

      <div className="m-2 border p-2">
        <label>Name:</label>
        <Input
          className="m-2 border p-2"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="m-2 border p-2">
        <label>Предмет</label>
        <SubjectDropdown
          onChange={(e) => setSubject(e.target.value)}
          selectedSubject={subject}
        />
      </div>
      <div className="m-2 border p-2">
        <label>Тип на корисник</label>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer gap-2 p-2 text-lg">
            <input
              type="checkbox"
              value="osnovno"
              checked={studentType.includes("osnovno")}
              onChange={(e) => {
                const { checked, value } = e.target;
                setStudentType((prev) =>
                  checked
                    ? [...prev, value]
                    : prev.filter((type) => type !== value),
                );
              }}
            />
            Основно
          </label>
          <label className="flex cursor-pointer gap-2 p-2 text-lg">
            <input
              type="checkbox"
              value="sredno"
              checked={studentType.includes("sredno")}
              onChange={(e) => {
                const { checked, value } = e.target;
                setStudentType((prev) =>
                  checked
                    ? [...prev, value]
                    : prev.filter((type) => type !== value),
                );
              }}
            />
            Средно
          </label>
          <label className="flex cursor-pointer gap-2 p-2 text-lg">
            <input
              type="checkbox"
              value="visoko"
              checked={studentType.includes("visoko")}
              onChange={(e) => {
                const { checked, value } = e.target;
                setStudentType((prev) =>
                  checked
                    ? [...prev, value]
                    : prev.filter((type) => type !== value),
                );
              }}
            />
            Високо
          </label>
        </div>
      </div>

      {schedule.map((slot, index) => (
        <div key={index} className="m-2 border p-2">
          <div className="p-4">
            <label>Day:</label>
            <select
              className="ml-2 cursor-pointer border p-2"
              value={slot.day}
              onChange={(e) =>
                handleScheduleChange(index, "day", e.target.value)
              }
            >
              {/* Populate day options */}
              <option value="">Select a day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 p-4">
              <label>Start Time:</label>
              <Input
                type="time"
                className="w-fit"
                value={slot.startTime}
                onChange={(e) =>
                  handleScheduleChange(index, "startTime", e.target.value)
                }
              />
            </div>

            <div className="flex items-center gap-2 p-4">
              <label>End Time:</label>
              <Input
                className="w-fit"
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  handleScheduleChange(index, "endTime", e.target.value)
                }
              />
            </div>
          </div>

          <Button onClick={() => handleRemoveTimeSlot(index)}>
            Избриши Термин <Trash />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        className="m-4"
        onClick={() => handleAddTimeSlot()}
      >
        Додади Нов Термин <Plus />
      </Button>
      <div className="mt-10"></div>
      <Button
        className="w-[250px]"
        onClick={() => {
          handleSaveUpdates();
        }}
      >
        Зачувај
      </Button>
      <Button variant="outline" className="ml-2" onClick={onCancel}>
        Откажи
      </Button>

      {error && <p className="mb-4 text-red-500">{error}</p>}
    </div>
  );
}

function AddAcademyGroup({ onAdd, setAddingGroup }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [studentType, setStudentType] = useState([]);
  const [schedule, setSchedule] = useState([
    { day: "", startTime: "", endTime: "" },
  ]);

  const [error, setError] = useState(""); // State to track validation errors

  const handleScheduleChange = (index, key, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][key] = value;
    setSchedule(newSchedule);
  };

  const handleAddTimeSlot = () => {
    setSchedule([...schedule, { day: "", startTime: "", endTime: "" }]);
  };

  const handleRemoveTimeSlot = (index) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validation Logic
    if (!name) {
      setError("Името е задолжително.");
      return;
    }
    if (!subject) {
      setError("Предметот е задолжителен.");
      return;
    }
    if (studentType.length === 0) {
      setError("Потребно е да изберете барем еден тип на корисник.");
      return;
    }

    if (schedule.length === 0) {
      setError("Потребно е да додадете барем еден термин.");
      return;
    }

    const allValidTimeSlots = schedule.every(
      (slot) => slot.day !== "" && slot.startTime !== "" && slot.endTime !== "",
    );

    if (!allValidTimeSlots) {
      setError("Сите термини мора да бидат валидни и пополнети.");
      return;
    }

    setError("");

    onAdd({ name, subject, studentType, schedule });
  };

  return (
    <div className="px-8">
      <h2 className="mb-5 text-2xl font-bold">Нова Академска Група</h2>
      <div className="max-w-[600px]">
        <div className="text-2xl">Основни Информации:</div>
        <div className="m-2 flex flex-col gap-4 border p-2">
          <div className="">
            <label>Име</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="">
            <label>Предмет</label>
            <SubjectDropdown
              onChange={(e) => setSubject(e.target.value)}
              selectedSubject={subject}
            />
          </div>
          <div className="">
            <label>Тип на корисник</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex cursor-pointer gap-2 p-2 text-lg">
                <input
                  type="checkbox"
                  value="osnovno"
                  checked={studentType.includes("osnovno")}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setStudentType((prev) =>
                      checked
                        ? [...prev, value]
                        : prev.filter((type) => type !== value),
                    );
                  }}
                />
                Основно
              </label>
              <label className="flex cursor-pointer gap-2 p-2 text-lg">
                <input
                  type="checkbox"
                  value="sredno"
                  checked={studentType.includes("sredno")}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setStudentType((prev) =>
                      checked
                        ? [...prev, value]
                        : prev.filter((type) => type !== value),
                    );
                  }}
                />
                Средно
              </label>
              <label className="flex cursor-pointer gap-2 p-2 text-lg">
                <input
                  type="checkbox"
                  value="visoko"
                  checked={studentType.includes("visoko")}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setStudentType((prev) =>
                      checked
                        ? [...prev, value]
                        : prev.filter((type) => type !== value),
                    );
                  }}
                />
                Високо
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 text-2xl">Термини за академска група</div>
        {schedule.map((slot, index) => (
          <div
            key={index}
            className="m-2 flex items-center justify-center gap-2 border p-2"
          >
            <div className="text-3xl">{index + 1}.</div>
            <div className="flex flex-col">
              <label>Day:</label>
              <select
                className="border p-2"
                value={slot.day}
                onChange={(e) =>
                  handleScheduleChange(index, "day", e.target.value)
                }
              >
                <option value="">Select a day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div className="">
              <label>Start Time:</label>
              <Input
                className="w-fit"
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  handleScheduleChange(index, "startTime", e.target.value)
                }
              />
            </div>
            <div className="">
              <label>End Time:</label>
              <Input
                className="w-fit"
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  handleScheduleChange(index, "endTime", e.target.value)
                }
              />
            </div>
            <Button
              variant="outline"
              className="m-2"
              onClick={() => handleRemoveTimeSlot(index)}
            >
              <Trash />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="ml-1 mt-4"
          onClick={handleAddTimeSlot}
        >
          + Додади термин
        </Button>
        <Separator className="my-8" />

        {/* Display validation error message */}
        {error && <p className="text-red-500">{error}</p>}

        <Button className=" w-[250px]" onClick={handleSave}>
          Зачувај
        </Button>
        <Button
          className="ml-2"
          variant="outline"
          onClick={() => setAddingGroup(false)}
        >
          Откажи
        </Button>
      </div>
    </div>
  );
}

function AcademyGroupManager() {
  const [academyGroups, setAcademyGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [addingGroup, setAddingGroup] = useState(false);

  useEffect(() => {
    const loadAcademyGroups = async () => {
      await MobxStore.userReady; // Wait for user to be ready
      if (MobxStore.user) {
        const result = await MobxStore.fetchAcademyGroupsForCurrentProfessor();
        if (result.success) {
          setAcademyGroups(MobxStore.academyGroups);
        } else {
          console.error(result.error);
        }
      }
    };

    loadAcademyGroups();
  }, []);

  const handleEditGroup = (group) => {
    setEditingGroup(group);
  };

  const handleDeleteGroup = async (groupId) => {
    const result = await MobxStore.deleteAcademyGroup(groupId);
    if (result.success) {
      setAcademyGroups(academyGroups.filter((group) => group.id !== groupId));
    }
  };

  const handleSaveGroup = async (updatedGroup) => {
    const result = await MobxStore.editAcademyGroup(
      updatedGroup.id,
      updatedGroup,
    );
    if (result.success) {
      setAcademyGroups(
        academyGroups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group,
        ),
      );
      setEditingGroup(null);
    }
  };

  const handleAddGroup = async (newGroup) => {
    console.log(newGroup);
    const result = await MobxStore.createAcademyGroup(
      newGroup.name,
      newGroup.subject,
      newGroup.studentType,
      newGroup.schedule,
    );
    if (result.success) {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      setAddingGroup(false);
    }
  };

  return (
    <div>
      {addingGroup ? (
        <AddAcademyGroup
          onAdd={handleAddGroup}
          setAddingGroup={setAddingGroup}
        />
      ) : editingGroup ? (
        <EditAcademyGroup
          group={editingGroup}
          onSave={handleSaveGroup}
          onCancel={() => setEditingGroup(null)}
        />
      ) : (
        <div>
          <AcademyGroupsList
            academyGroups={academyGroups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
          />
          <Button
            className="m-2 border  p-2"
            onClick={() => setAddingGroup(true)}
          >
            + Нова Академска Група
          </Button>
        </div>
      )}
    </div>
  );
}

const Termini = observer(() => {
  const [date, setDate] = useState("");
  const [timeRanges, setTimeRanges] = useState([{ from: "", to: "" }]);
  const [error, setError] = useState(""); // State for error handling

  const handleAddTimeRange = () => {
    setTimeRanges([...timeRanges, { from: "", to: "" }]);
  };

  const handleRemoveTimeRange = (index) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  const handleTimeRangeChange = (index, key, value) => {
    const newTimeRanges = [...timeRanges];
    newTimeRanges[index][key] = value;
    setTimeRanges(newTimeRanges);
  };

  const handleAddScheduleEntry = async () => {
    // Validation for date
    if (!date) {
      setError("Ве молиме одберете датум.");
      return;
    }

    // Validation for time ranges
    const hasValidTimeRange = timeRanges.some(
      (range) => range.from !== "" && range.to !== "",
    );

    if (!hasValidTimeRange) {
      setError("Ве молиме додадете барем еден валиден термин.");
      return;
    }

    // Clear errors if validation passes
    setError("");

    const dateObject = new Date(date); // Ensure the date is a Date object
    const result = await MobxStore.addScheduleEntry(dateObject, timeRanges);
    setDate("");
    setTimeRanges([{ from: "", to: "" }]);
    if (result.success) {
      console.log("Schedule entry added successfully");
    } else {
      console.error("Failed to add schedule entry.");
    }
  };

  return (
    <div className="p-5">
      <h2 className="mb-5 text-2xl font-bold">Нов Термин</h2>
      <div className="mb-4 flex w-fit flex-col">
        <label className="mb-2 text-lg font-semibold">Одберете Датум</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="mb-4">
        <h2 className="mb-2 text-lg font-semibold">Термини</h2>
        {timeRanges.map((range, index) => (
          <div
            key={index}
            className="mb-2 flex flex-wrap items-center space-x-2"
          >
            <input
              type="time"
              value={range.from}
              onChange={(e) =>
                handleTimeRangeChange(index, "from", e.target.value)
              }
              className="rounded border px-3 py-2"
            />
            <span>до</span>
            <input
              type="time"
              value={range.to}
              onChange={(e) =>
                handleTimeRangeChange(index, "to", e.target.value)
              }
              className="rounded border px-3 py-2"
            />
            <button
              onClick={() => handleRemoveTimeRange(index)}
              className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
            >
              Избриши
            </button>
          </div>
        ))}
        <Button onClick={handleAddTimeRange} variant="outline">
          + Додади термин
        </Button>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <button
        onClick={() => handleAddScheduleEntry()}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Зачувај ги сите термини
      </button>
      <h2 className="mb-5 mt-16 text-2xl font-bold">Tермини</h2>

      <Calendar
        schedule={MobxStore.user?.schedule}
        professor={MobxStore.user}
        isAdmin
      />
    </div>
  );
});

const ProfessorAdminPage = () => {
  const [activeTab, setActiveTab] = useState("academyGroup"); // State to track the active tab

  // Function to render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "academyGroup":
        return <AcademyGroupManager />;
      case "termini":
        return <Termini />;
      case "events":
        return <EventList />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            !(activeTab === "academyGroup")
              ? "border-b-2 border-transparent text-blue-600"
              : "border-b-2 border-gray-300 text-gray-600"
          }`}
          onClick={() => setActiveTab("academyGroup")}
        >
          Академии
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            !(activeTab === "termini")
              ? "border-b-2 border-transparent text-blue-600"
              : "border-b-2 border-gray-300 text-gray-600"
          }`}
          onClick={() => setActiveTab("termini")}
        >
          Термини
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            !(activeTab === "events")
              ? "border-b-2 border-transparent text-blue-600"
              : "border-b-2 border-gray-300 text-gray-600"
          }`}
          onClick={() => setActiveTab("events")}
        >
          Настани
        </button>
      </div>

      {/* Render the active component */}
      <div className="p-2 sm:p-8">{renderActiveComponent()}</div>
    </div>
  );
};

export default withProfAuth(ProfessorAdminPage);

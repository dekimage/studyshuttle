"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Title } from "../_components/ReusableDivs";
import MobxStore from "@/src/app/mobx";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Calendar from "../_components/Calendar";
import { observer } from "mobx-react";
import EventList from "../_components/EventList";
import withAuth from "@/src/Components/AuthHoc";
import withProfAuth from "@/src/Components/AuthProfHoc";

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
      <h2 className="p-2 text-2xl">Academy Groups</h2>
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
            <Button onClick={() => onEdit(group)}>Edit</Button>
            <Button
              className="ml-2 bg-red-400"
              onClick={() => onDelete(group.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditAcademyGroup({ group, onSave, onCancel }) {
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

  return (
    <div>
      <h2>Edit Academy Group</h2>

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
        <label>Subject:</label>
        <Input
          className="m-2 border p-2"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label>Student Type:</label>
        <Input
          type="text"
          value={studentType}
          onChange={(e) => setStudentType(e.target.value)}
        />
      </div>

      {schedule.map((slot, index) => (
        <div key={index} className="m-2 border p-2">
          <label>Day:</label>
          <select
            value={slot.day}
            onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
          >
            {/* Populate day options */}
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
          <label>Start Time:</label>
          <Input
            type="time"
            value={slot.startTime}
            onChange={(e) =>
              handleScheduleChange(index, "startTime", e.target.value)
            }
          />
          <label>End Time:</label>
          <Input
            type="time"
            value={slot.endTime}
            onChange={(e) =>
              handleScheduleChange(index, "endTime", e.target.value)
            }
          />
          <Button onClick={() => handleRemoveTimeSlot(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => handleAddTimeSlot()}>Add Time Slot</Button>
      <Button
        onClick={() =>
          onSave({
            ...group,
            name,
            subject,
            studentType,
            schedule,
          })
        }
      >
        Save Changes
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  );
}

function AddAcademyGroup({ onAdd, setAddingGroup }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [studentType, setStudentType] = useState("");
  const [schedule, setSchedule] = useState([
    { day: "", startTime: "", endTime: "" },
  ]);

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

  return (
    <div className="px-8">
      <h2>Add Academy Group</h2>
      <div className="max-w-[600px]">
        <div className="text-2xl">Basic Info:</div>
        <div className="m-2 flex flex-col gap-4 border p-2">
          <div className="">
            <label>Name:</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="">
            <label>Subject:</label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="">
            <label>Student Type:</label>
            <Input
              type="text"
              value={studentType}
              onChange={(e) => setStudentType(e.target.value)}
            />
          </div>
        </div>

        <div className="text-2xl">Time Slots:</div>
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
          + Add Time Slot
        </Button>
        <Separator className="my-8" />
        <Button onClick={() => onAdd({ name, subject, studentType, schedule })}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setAddingGroup(false)}>
          Cancel
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
      // Reload or add the new group to the list
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
            + New Group
          </Button>
        </div>
      )}
    </div>
  );
}

const Termini = observer(() => {
  const [date, setDate] = useState("");
  const [timeRanges, setTimeRanges] = useState([{ from: "", to: "" }]);

  // const [schedule, setSchedule] = useState([]);

  // useEffect(() => {
  //   const fetchSchedule = async () => {
  //     await MobxStore.userReady;
  //     setSchedule(MobxStore.user?.schedule || []);
  //   };

  //   fetchSchedule();
  // }, [MobxStore.user?.schedule]);

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
    if (!date) {
      console.error("Please select a date.");
      return;
    }

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
      <h2 className="mb-5 text-2xl font-bold">Manage Schedule</h2>
      <div className="mb-4">
        <label className="mb-2 block font-semibold">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="mb-4">
        <h4 className="mb-2 text-lg font-semibold">Time Ranges:</h4>
        {timeRanges.map((range, index) => (
          <div key={index} className="mb-2 flex items-center space-x-2">
            <input
              type="time"
              value={range.from}
              onChange={(e) =>
                handleTimeRangeChange(index, "from", e.target.value)
              }
              className="rounded border px-3 py-2"
            />
            <span>to</span>
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
              Remove
            </button>
          </div>
        ))}
        <Button onClick={handleAddTimeRange} variant="outline">
          + Add Time Range
        </Button>
      </div>
      <button
        onClick={() => handleAddScheduleEntry()}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Add Schedule Entry
      </button>
      <div className="mt-10">
        <Calendar
          schedule={MobxStore.user?.schedule}
          professor={MobxStore.user}
          isAdmin
        />
      </div>
    </div>
  );
});

const ProfessorAdminPage = () => {
  return (
    <div className="flex flex-col">
      <AcademyGroupManager />
      <Termini />
      <EventList />
    </div>
  );
};

export default withProfAuth(ProfessorAdminPage);

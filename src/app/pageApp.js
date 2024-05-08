import { Title } from "./_components/ReusableDivs";
import { DataTable, columns } from "./eventsTable";
const dummyEventData = [
  {
    id: 1,
    date: "2024-01-25",
    professor: "John Smith",
    subject: "Mathematics",
  },
  {
    id: 2,
    date: "2024-02-02",
    professor: "Alice Johnson",
    subject: "History",
  },
  {
    id: 3,
    date: "2024-02-15",
    professor: "Sarah Brown",
    subject: "Science",
  },
  {
    id: 4,
    date: "2024-03-10",
    professor: "Michael Davis",
    subject: "English",
  },
  {
    id: 5,
    date: "2024-03-20",
    professor: "Emily Wilson",
    subject: "Art",
  },
];

const EventsPage = () => {
  return (
    <div>
      <Title>Часови</Title>
      <DataTable columns={columns} data={dummyEventData} />
    </div>
  );
};

export default EventsPage;

export const SUBJECTS = [
  { id: "maths", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "art", label: "Art" },
  { id: "pe", label: "Physical Education" },
];

export const ODDELENIJA = [
  { id: "1", label: "1во одд" },
  { id: "2", label: "2ро одд" },
  { id: "3", label: "3то одд" },
  { id: "4", label: "4то одд" },
  { id: "5", label: "5то одд" },
  { id: "6", label: "6то одд" },
  { id: "7", label: "7мо одд" },
  { id: "8", label: "8мо одд" },
  { id: "9", label: "9то одд" },

  { id: "10", label: "1ва година" },
  { id: "11", label: "2ра година" },
  { id: "12", label: "3та година" },
  { id: "13", label: "4та година" },
];

export const filterOddByIds = (oddIds) => {
  return ODDELENIJA.filter((odd) => oddIds.includes(odd.id))[0];
};

export const filterSubjectsByIds = (subjectIds) => {
  return SUBJECTS.filter((subject) => subjectIds.includes(subject.id));
};

export const SubjectDropdown = ({
  onChange,
  selectedSubject,
  subjects = false,
}) => {
  const subjectsArray = subjects ? subjects : SUBJECTS;
  return (
    <div className="">
      <select
        className="w-full rounded-lg border p-2"
        onChange={onChange}
        value={selectedSubject}
      >
        {subjectsArray.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const OddDropdown = ({ onChange, selectedSubject }) => {
  return (
    <div className="">
      <select
        className="w-full rounded-lg border p-2"
        onChange={onChange}
        value={selectedSubject}
      >
        {ODDELENIJA.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// const MyComponent = () => {
//   const [selectedSubject, setSelectedSubject] = useState("");

//   const handleSubjectChange = (event) => {
//     setSelectedSubject(event.target.value);
//   };

//   return (
//     <div>
//       <SubjectDropdown onChange={handleSubjectChange} selectedSubject={selectedSubject} />
//     </div>
//   );
// };

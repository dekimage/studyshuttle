export const SUBJECTS = [
  { id: "maths", label: "Математика" },
  { id: "science", label: "Наука" },
  { id: "history", label: "Историја" },
  { id: "art", label: "Уметност" },
  { id: "pe", label: "Фузичко" },
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

export const OddDropdown = ({ onChange, selectedSubject, academicLevel }) => {
  // Filter the options based on the academic level
  const filteredOptions =
    academicLevel === "osnovno"
      ? ODDELENIJA.filter(
          (subject) => parseInt(subject.id) >= 1 && parseInt(subject.id) <= 9,
        )
      : academicLevel === "sredno"
        ? ODDELENIJA.filter(
            (subject) =>
              parseInt(subject.id) >= 10 && parseInt(subject.id) <= 13,
          )
        : [{ id: "15", label: "fax" }]; // Empty array if academic level does not match
  return (
    <div className="">
      <select
        className="w-full rounded-lg border p-2"
        onChange={onChange}
        value={selectedSubject}
      >
        {/* Default placeholder option */}
        <option value="" disabled selected={!selectedSubject}>
          Изберете едно
        </option>
        {filteredOptions.map((subject) => (
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

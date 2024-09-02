export const issueEmailTemplate = (title, text) => {
  return {
    subject: `Issue Report: ${title}`,
    text: `An issue has been reported:\n\n${text}`,
  };
};

export const classReservationTemplate = (
  studentName,
  professorName,
  date,
  timeRange,
  subject,
  classType,
  notes,
) => {
  return {
    studentEmail: {
      subject: `Class Reservation Confirmation`,
      text: `Hi ${studentName},\n\nYou have successfully reserved a one-on-one class with Professor ${professorName} on ${date} during ${timeRange} for ${subject} (${classType}).\n\nNotes: ${notes}`,
    },
    professorEmail: {
      subject: `New Class Reservation`,
      text: `Dear Professor ${professorName},\n\nA new student, ${studentName}, has reserved a one-on-one class with you on ${date} during ${timeRange} for ${subject} (${classType}).\n\nNotes: ${notes}`,
    },
  };
};

export const groupJoinTemplate = (
  studentName,
  groupName,
  professorName,
  schedule,
) => {
  const scheduleDetails = schedule
    .map((slot) => `${slot.day}: ${slot.startTime} - ${slot.endTime}`)
    .join("\n");

  return {
    studentEmail: {
      subject: `Academy Group Join Confirmation`,
      text: `Hi ${studentName},\n\nYou have successfully joined the academy group ${groupName} under Professor ${professorName}.\n\nThe group meets on the following schedule:\n${scheduleDetails}`,
    },
    professorEmail: {
      subject: `New Student Joined Your Group`,
      text: `Dear Professor ${professorName},\n\nA new student, ${studentName}, has joined your academy group ${groupName}.\n\nGroup Schedule:\n${scheduleDetails}`,
    },
  };
};

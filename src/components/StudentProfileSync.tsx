import { useEffect } from "react";

import { useGetDashboardQuery } from "@/src/api/student/student.api";
import { useAuth } from "@/src/context/AuthContext";

function getFreshName(studentName?: string) {
  const cleaned = String(studentName || "").trim();

  if (!cleaned) return null;

  const [firstName = "", ...rest] = cleaned.split(/\s+/);
  const lastName = rest.join(" ").trim();

  return { firstName, lastName };
}

export default function StudentProfileSync() {
  const { selectedStudent, setSelectedStudent } = useAuth();
  const studentId = selectedStudent?._id;

  const { data } = useGetDashboardQuery(
    { studentId: studentId! },
    { skip: !studentId },
  );

  useEffect(() => {
    if (!data || !selectedStudent || !studentId) return;

    const freshName = getFreshName(data.studentName);
    const freshClassName = String(data.className || "").trim();
    const freshSectionName = String(data.sectionName || "").trim();

    const currentName = `${selectedStudent.firstName || ""} ${
      selectedStudent.lastName || ""
    }`.trim();
    const currentClassName =
      typeof selectedStudent.classId === "object"
        ? String(selectedStudent.classId?.name || "").trim()
        : "";
    const currentSectionName =
      typeof selectedStudent.sectionId === "object"
        ? String(selectedStudent.sectionId?.name || "").trim()
        : "";

    const nextStudent: any = { ...selectedStudent };
    let changed = false;

    if (
      freshName &&
      (freshName.firstName !== selectedStudent.firstName ||
        freshName.lastName !== selectedStudent.lastName)
    ) {
      nextStudent.firstName = freshName.firstName;
      nextStudent.lastName = freshName.lastName;
      changed = true;
    }

    if (
      freshClassName &&
      freshClassName !== currentClassName &&
      typeof selectedStudent.classId === "object"
    ) {
      nextStudent.classId = {
        ...selectedStudent.classId,
        name: freshClassName,
      };
      changed = true;
    }

    if (
      freshSectionName &&
      freshSectionName !== "All" &&
      freshSectionName !== currentSectionName &&
      typeof selectedStudent.sectionId === "object"
    ) {
      nextStudent.sectionId = {
        ...selectedStudent.sectionId,
        name: freshSectionName,
      };
      changed = true;
    }

    if (!changed && currentName === data.studentName) {
      return;
    }

    if (changed) {
      void setSelectedStudent(nextStudent);
    }
  }, [data, selectedStudent, setSelectedStudent, studentId]);

  return null;
}

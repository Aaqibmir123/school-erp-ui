"use client";

import { Select, Tag } from "antd";

interface Props {
  value: any;
  subjects: any[];
  teachers: any[];
  onChange: (field: string, value: any) => void;
}

export default function CellSelector({
  value = {},
  subjects = [],
  teachers = [],
  onChange,
}: Props) {
  /* =========================
     🔥 MERGE + FALLBACK
  ========================= */

  const mergedTeachers = [...(teachers || [])];

  // 🔥 ensure selected teacher always exists
  if (
    value.teacherId &&
    !mergedTeachers.find((t: any) => String(t._id) === String(value.teacherId))
  ) {
    mergedTeachers.push({
      _id: value.teacherId,
      name: "⚠️ Unknown Teacher",
      subjects: [],
    });
  }

  /* =========================
     FILTER TEACHERS
  ========================= */

  const filteredTeachers = mergedTeachers.filter((t: any) => {
    if (!value.subjectId) return true;

    return (
      t.subjects?.map(String).includes(String(value.subjectId)) ||
      String(t._id) === String(value.teacherId) // 🔥 KEEP SELECTED
    );
  });

  /* =========================
     FIND SELECTED TEACHER
  ========================= */

  const selectedTeacher = mergedTeachers.find(
    (t: any) => String(t._id) === String(value.teacherId),
  );

  /* =========================
     MISMATCH CHECK
  ========================= */

  const isMismatch =
    selectedTeacher &&
    value.subjectId &&
    !selectedTeacher.subjects?.map(String).includes(String(value.subjectId));

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* SUBJECT */}
      <Select
        placeholder="Subject"
        value={value.subjectId ? String(value.subjectId) : undefined}
        onChange={(val) => onChange("subjectId", val)}
        size="small"
        style={{ width: "100%" }}
        options={subjects.map((s: any) => ({
          label: s.name,
          value: String(s._id),
        }))}
      />

      {/* TEACHER */}
      <Select
        placeholder="Teacher"
        value={value.teacherId ? String(value.teacherId) : undefined}
        onChange={(val) => onChange("teacherId", val)}
        size="small"
        disabled={!value.subjectId}
        style={{ width: "100%" }}
        options={filteredTeachers.map((t: any) => ({
          label: t.name || "⚠️ Unknown Teacher",
          value: String(t._id),
        }))}
      />

      {/* ⚠️ WARNING */}
      {isMismatch && (
        <Tag color="red" style={{ fontSize: 11 }}>
          Teacher not assigned to this subject
        </Tag>
      )}
    </div>
  );
}

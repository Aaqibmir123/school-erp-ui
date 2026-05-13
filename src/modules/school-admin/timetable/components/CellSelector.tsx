"use client";

import { Button, Select, Tag } from "antd";

interface Props {
  value: any;
  subjects: any[];
  teachers: any[];
  onChange: (field: string, value: any) => void;
  onClear?: () => void;
  showClearAction?: boolean;
}

export default function CellSelector({
  value = {},
  subjects = [],
  teachers = [],
  onChange,
  onClear,
  showClearAction = false,
}: Props) {
  const handleSubjectChange = (nextSubjectId?: string) => {
    const normalized = nextSubjectId || undefined;

    onChange("subjectId", normalized);

    if (!normalized || String(normalized) !== String(value.subjectId)) {
      onChange("teacherId", undefined);
    }
  };

  const handleTeacherChange = (nextTeacherId?: string) => {
    onChange("teacherId", nextTeacherId || undefined);
  };

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
        placeholder="Select subject"
        value={value.subjectId ? String(value.subjectId) : undefined}
        allowClear
        onChange={handleSubjectChange}
        size="small"
        style={{ width: "100%" }}
        options={subjects.map((s: any) => ({
          label: s.name,
          value: String(s._id),
        }))}
      />

      {/* TEACHER */}
      <Select
        placeholder="Select teacher"
        value={value.teacherId ? String(value.teacherId) : undefined}
        allowClear
        onChange={handleTeacherChange}
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

      {showClearAction && onClear ? (
        <Button
          size="small"
          type="link"
          onClick={onClear}
          style={{ alignSelf: "flex-end", paddingInline: 0, height: "auto" }}
        >
          Clear this slot
        </Button>
      ) : null}

    </div>
  );
}

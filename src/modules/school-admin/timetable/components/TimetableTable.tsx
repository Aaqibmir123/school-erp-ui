"use client";

import { Select } from "antd";

/* RTK */
import { useGetClassesQuery } from "@/src/modules/school-admin/classes/classes";
import { useGetSubjectsByClassQuery } from "@/src/modules/school-admin/subjects/subject.api";

/* COMPONENT */
import DragTimetable from "@/src/modules/school-admin/timetable/components/DragTimetable";

import { useState } from "react";

export default function TimetablePage() {
  const [classId, setClassId] = useState<string>("");

  /* ================= RTK ================= */

  const { data: classes = [] } = useGetClassesQuery();

  const { data: subjectsData } = useGetSubjectsByClassQuery(classId, {
    skip: !classId,
  });

  /* 🔥 FIX */
  const subjects = subjectsData || [];

  /* ================= UI ================= */

  return (
    <div>
      {/* CLASS SELECT */}

      <Select
        placeholder="Select Class"
        style={{ width: 200, marginBottom: 20 }}
        onChange={setClassId}
        options={classes.map((c: any) => ({
          label: c.name,
          value: c._id,
        }))}
      />

      {/* TIMETABLE */}

      {classId && <DragTimetable subjects={subjects} classId={classId} />}
    </div>
  );
}

"use client";

import { Card, Select, Spin } from "antd";
import { useEffect, useState } from "react";

import DragTimetable from "./components/DragTimetable";

import { getClassesApi } from "../classes/api/class.api";
import { useGetTimetableQuery } from "./api/createTimetable";

import { useGetTeachersByClassQuery } from "../api/teacherApi";
import { useGetPeriodsQuery } from "../periods/periodApi";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useGetSubjectsByClassQuery } from "../subjects/subject.api";

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

  /* ================= SUBJECTS ================= */
  const { data: subjects = [], isLoading: sLoad } = useGetSubjectsByClassQuery(
    classId,
    {
      skip: !classId,
    },
  );

  /* ================= TEACHERS ================= */
  const { data: teachers = [], isLoading: tLoad } = useGetTeachersByClassQuery(
    classId,
    {
      skip: !classId,
    },
  );

  /* ================= PERIODS ================= */
  const { data: periods = [], isLoading: pLoad } = useGetPeriodsQuery();

  /* ================= SECTIONS ================= */
  const { data: sections = [], isLoading: secLoad } =
    useGetSectionsByClassQuery(classId, {
      skip: !classId,
    });

  /* ================= CHECK ================= */
  const hasSections = sections && sections.length > 0;

  /* ================= TIMETABLE ================= */
  const {
    data: timetableRes,
    isLoading: loadingTT,
    refetch,
  } = useGetTimetableQuery(
    {
      classId,
      sectionId: hasSections ? sectionId : undefined, // 💣 FIX
    },
    {
      skip: !classId || (hasSections && !sectionId), // 💣 FIX
    },
  );

  const timetableData = timetableRes?.data || [];

  const isLoading = sLoad || tLoad || pLoad || secLoad || loadingTT;

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    (async () => {
      const res = await getClassesApi();
      setClasses(res || []);
    })();
  }, []);

  /* ================= RESET SECTION ================= */
  useEffect(() => {
    setSectionId("");
  }, [classId]);

  /* ================= AUTO HANDLE NO SECTION ================= */
  useEffect(() => {
    if (!hasSections) {
      setSectionId(""); // no section case
    }
  }, [hasSections]);

  return (
    <Card title="📅 Class Timetable">
      {/* 🔥 CLASS */}
      <Select
        placeholder="Select Class"
        style={{ width: 220, marginBottom: 20 }}
        onChange={setClassId}
        value={classId || undefined}
        options={classes.map((c) => ({
          label: c.name,
          value: c._id,
        }))}
      />

      {/* 🔥 SECTION (ONLY IF EXISTS) */}
      {hasSections && (
        <Select
          placeholder="Select Section"
          style={{ width: 220, marginBottom: 20, marginLeft: 10 }}
          onChange={setSectionId}
          value={sectionId || undefined}
          options={sections.map((s) => ({
            label: s.name,
            value: s._id,
          }))}
        />
      )}

      {!hasSections && classId && (
        <div style={{ marginBottom: 10, color: "#999" }}>
          ⚠️ No sections for this class — using default timetable
        </div>
      )}

      {isLoading && <Spin />}

      {/* 🔥 TIMETABLE */}
      {classId && (!hasSections || sectionId) && !isLoading && (
        <DragTimetable
          subjects={subjects}
          teachers={teachers}
          periods={periods}
          classId={classId}
          sectionId={hasSections ? sectionId : null} // 💣 IMPORTANT
          initialData={timetableData}
          refetchTimetable={refetch}
        />
      )}
    </Card>
  );
}

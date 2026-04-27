"use client";

import { Card, Select, Space, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";

import BrandLoader from "@/src/components/BrandLoader";

import DragTimetable from "./components/DragTimetable";

import { getClassesApi } from "../classes/api/class.api";
import { useGetTimetableQuery } from "./api/createTimetable";

import { useGetTeachersByClassQuery } from "../api/teacherApi";
import { useGetPeriodsQuery } from "../periods/periodApi";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useGetSubjectsByClassQuery } from "../subjects/subject.api";
import type { SchoolTimingSettings } from "../school/schoolSettings.types";

const TIMING_STORAGE_KEY = "school-admin:timing-settings";

const parseSchoolTimings = (): Partial<SchoolTimingSettings> => {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(TIMING_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Partial<SchoolTimingSettings>;
  } catch {
    return {};
  }
};

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [schoolTiming, setSchoolTiming] = useState<Partial<SchoolTimingSettings>>(
    {},
  );

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

  const timingSummary = useMemo(() => {
    const start = schoolTiming.schoolStartTime || "08:00";
    const end = schoolTiming.schoolEndTime || "15:00";
    const days = schoolTiming.workingDays?.join(", ") || "Mon-Fri";

    return { days, end, start };
  }, [schoolTiming]);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    (async () => {
      const res = await getClassesApi();
      setClasses(res || []);
    })();
  }, []);

  /* ================= LOAD SCHOOL TIMING ================= */
  useEffect(() => {
    const syncTiming = () => setSchoolTiming(parseSchoolTimings());

    syncTiming();
    window.addEventListener("school-timing-updated", syncTiming);

    return () => window.removeEventListener("school-timing-updated", syncTiming);
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
      <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
        <Tag color="blue">School: {timingSummary.start}</Tag>
        <Tag color="blue">Ends: {timingSummary.end}</Tag>
        <Tag color="blue">Days: {timingSummary.days}</Tag>
      </Space>

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

      {isLoading && <BrandLoader compact />}

      {/* 🔥 TIMETABLE */}
      {classId && (!hasSections || sectionId) && !isLoading && (
        <DragTimetable
          subjects={subjects}
          teachers={teachers}
          periods={periods}
          classId={classId}
          schoolTiming={schoolTiming}
          sectionId={hasSections ? sectionId : null} // 💣 IMPORTANT
          initialData={timetableData}
          refetchTimetable={refetch}
        />
      )}
    </Card>
  );
}

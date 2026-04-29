"use client";

import { Card, Empty, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

import BrandLoader from "@/src/components/BrandLoader";
import { useGetTeachersByClassQuery } from "../api/teacherApi";
import { useGetClassesQuery } from "../classes/classes";
import { useGetPeriodsQuery } from "../periods/periodApi";
import type {
  SchoolTimingSettings,
  WeekdayValue,
} from "../school/schoolSettings.types";
import { useSchool } from "../school/useSchool";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useGetSubjectsByClassQuery } from "../subjects/subject.api";
import { useGetTimetableQuery } from "./api/createTimetable";
import DragTimetable from "./components/DragTimetable";

export default function TimetablePage() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const { data: classes = [], isLoading: classesLoading } =
    useGetClassesQuery();
  const { school } = useSchool();

  const schoolTiming: Partial<SchoolTimingSettings> = useMemo(
    () => ({
      schoolStartTime: school?.schoolStartTime,
      schoolEndTime: school?.schoolEndTime,
      workingDays: school?.workingDays as WeekdayValue[] | undefined,
    }),
    [school],
  );

  const { data: subjects = [], isLoading: sLoad } = useGetSubjectsByClassQuery(
    classId,
    { skip: !classId },
  );
  const { data: teachers = [], isLoading: tLoad } = useGetTeachersByClassQuery(
    classId,
    { skip: !classId },
  );
  const { data: periods = [], isLoading: pLoad } = useGetPeriodsQuery();
  const { data: sections = [], isLoading: secLoad } =
    useGetSectionsByClassQuery(classId, {
      skip: !classId,
    });

  const hasSections = sections.length > 0;

  const {
    data: timetableRes,
    isLoading: loadingTT,
    refetch,
  } = useGetTimetableQuery(
    {
      classId,
      sectionId: hasSections ? sectionId : undefined,
    },
    {
      skip: !classId || (hasSections && !sectionId),
    },
  );

  const timetableData = timetableRes?.data || [];
  const isLoading = sLoad || tLoad || pLoad || secLoad || loadingTT;

  const timingSummary = useMemo(() => {
    const formatDisplayTime = (value?: string, fallback?: string) =>
      dayjs(value || fallback, "HH:mm").format("h:mm A");

    const start = formatDisplayTime(schoolTiming.schoolStartTime, "08:00");
    const end = formatDisplayTime(schoolTiming.schoolEndTime, "15:00");
    const days = schoolTiming.workingDays?.join(", ") || "Mon-Fri";
    return { days, end, start };
  }, [schoolTiming]);

  useEffect(() => {
    setSectionId("");
  }, [classId]);

  useEffect(() => {
    if (!hasSections) {
      setSectionId("");
    }
  }, [hasSections]);

  return (
    <Card
      title="Class Timetable"
      styles={{
        header: { borderBottom: "1px solid #eef2ff", paddingInline: 24 },
        body: { padding: 24 },
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            border: "1px solid #dbe7ff",
            background:
              "linear-gradient(135deg, rgba(239,246,255,0.95) 0%, rgba(248,250,255,0.98) 100%)",
            borderRadius: 18,
            padding: 16,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1d4ed8" }}>
            School Schedule
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #dbe7ff",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Start
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {timingSummary.start}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #dbe7ff",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                End
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {timingSummary.end}
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #dbe7ff",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Working Days
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.4,
                }}
              >
                {timingSummary.days}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: 18,
            padding: 16,
            display: "grid",
            gap: 12,
            alignContent: "start",
            alignSelf: "start",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Timetable Scope
          </div>

          <Select
            placeholder="Select class"
            loading={classesLoading}
            size="large"
            style={{ width: "100%" }}
            onChange={setClassId}
            value={classId || undefined}
            options={classes.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
          />

          {hasSections ? (
            <Select
              placeholder="Select section"
              size="large"
              style={{ width: "100%" }}
              onChange={setSectionId}
              value={sectionId || undefined}
              options={sections.map((item) => ({
                label: item.name,
                value: item._id,
              }))}
            />
          ) : null}
        </div>
      </div>

      {classes.length === 0 && !classesLoading ? (
        <Empty description="No classes available yet. Create classes first." />
      ) : (
        <>
          {!hasSections && classId ? null : null}

          {isLoading ? <BrandLoader compact /> : null}

          {classId &&
          (!hasSections || sectionId) &&
          !isLoading ? (
            <DragTimetable
              subjects={subjects}
              teachers={teachers}
              periods={periods}
              classId={classId}
              schoolTiming={schoolTiming}
              sectionId={hasSections ? sectionId : null}
              initialData={timetableData}
              refetchTimetable={refetch}
            />
          ) : null}
        </>
      )}
    </Card>
  );
}

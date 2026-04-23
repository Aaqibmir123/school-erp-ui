"use client";

import { Card, Empty, Select, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";

import { useGetClassesQuery } from "../classes/classes";
import FeeTable from "./components/FeeTable";
import { useGetAllStudentsByClassQuery } from "./studentApi";

const { Text } = Typography;

export default function FeePage() {
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();

  const { data: classes = [], isLoading } = useGetClassesQuery();

  /* ================= 1️⃣ SECTION DETECT API ================= */

  const { data: allStudents = [] } = useGetAllStudentsByClassQuery(
    {
      classId: classId!,
      sectionId: sectionId || undefined,
    },
    {
      skip: !classId,
      refetchOnMountOrArgChange: true,
    },
  );

  /* ================= EXTRACT SECTIONS ================= */

  const sections = useMemo(() => {
    const map = new Map();

    allStudents.forEach((s: any) => {
      if (s.sectionId && s.sectionName) {
        map.set(s.sectionId, {
          id: s.sectionId,
          name: s.sectionName,
        });
      }
    });

    return Array.from(map.values());
  }, [allStudents]);

  const hasSections = sections.length > 0;

  /* ================= 2️⃣ STUDENT TABLE API ================= */

  const shouldSkip = !classId || (hasSections && !sectionId);

  const { data: students = [], isLoading: studentsLoading } =
    useGetAllStudentsByClassQuery(
      { classId: classId!, sectionId: sectionId || "" },
      { skip: shouldSkip },
    );

  /* ================= AUTO SELECT FIRST SECTION ================= */

  useEffect(() => {
    if (hasSections && !sectionId) {
      // optional: auto select
      // setSectionId(sections[0].id);
    }
  }, [hasSections, sections]);

  /* ================= CLASS OPTIONS ================= */

  const classOptions = classes.map((cls: any) => ({
    label: cls.name,
    value: cls._id,
  }));

  /* ================= UI ================= */

  return (
    <Card title="Fees Management">
      <Space wrap style={{ marginBottom: 16 }}>
        {/* CLASS */}
        <Select
          placeholder="Select Class"
          style={{ width: 220 }}
          loading={isLoading}
          options={classOptions}
          value={classId}
          onChange={(val) => {
            setClassId(val);
            setSectionId(undefined);
          }}
        />

        {/* SECTION */}
        <Select
          placeholder={hasSections ? "Select Section" : "No Section Available"}
          style={{ width: 220 }}
          value={sectionId}
          disabled={!classId || !hasSections}
          onChange={(val) => setSectionId(val)}
          options={sections.map((s) => ({
            label: s.name,
            value: s.id, // ✅ ObjectId
          }))}
        />
      </Space>

      {/* ================= STATES ================= */}

      {!classId ? (
        <Empty description="Select class to load students" />
      ) : hasSections && !sectionId ? (
        <Empty description="Please select section first" />
      ) : (
        <FeeTable students={students} loading={studentsLoading} />
      )}
    </Card>
  );
}

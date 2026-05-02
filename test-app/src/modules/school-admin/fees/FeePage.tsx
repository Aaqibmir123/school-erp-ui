"use client";

import {
  Card,
  Empty,
  Input,
  Select,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useMemo, useState } from "react";

import { useGetClassesQuery } from "../classes/classes";
import FeeTable from "./components/FeeTable";
import { useGetAllStudentsByClassQuery } from "./studentApi";

const { Text } = Typography;

export default function FeePage() {
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [search, setSearch] = useState("");

  const { data: classes = [], isLoading } = useGetClassesQuery();

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

  const sections = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();

    allStudents.forEach((student: any) => {
      if (student.sectionId && student.sectionName) {
        map.set(student.sectionId, {
          id: student.sectionId,
          name: student.sectionName,
        });
      }
    });

    return Array.from(map.values());
  }, [allStudents]);

  const hasSections = sections.length > 0;
  const shouldSkip = !classId || (hasSections && !sectionId);

  const { data: students = [], isLoading: studentsLoading } =
    useGetAllStudentsByClassQuery(
      { classId: classId!, sectionId: sectionId || "" },
      { skip: shouldSkip },
    );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return students;

    return students.filter((student: any) => {
      const searchable = [
        student.name,
        student.fatherName,
        student.parentPhone,
        student.rollNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [students, search]);

  const classOptions = classes.map((cls: any) => ({
    label: cls.name,
    value: cls._id,
  }));

  return (
    <Card
      title={
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Text strong style={{ fontSize: 20 }}>
            Fees Management
          </Text>
          <Text type="secondary">
            Review fee history and add or edit fee records for the selected student.
          </Text>
        </div>
      }
      style={{
        border: "1px solid #dbeafe",
        borderRadius: 20,
        boxShadow: "0 16px 36px rgba(37, 99, 235, 0.08)",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 20 } }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(14,165,233,0.08))",
          border: "1px solid rgba(59,130,246,0.16)",
          borderRadius: 16,
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: 18,
          padding: 16,
        }}
      >
        <Select
          placeholder="Select Class"
          style={{ width: "100%" }}
          loading={isLoading}
          options={classOptions}
          value={classId}
          onChange={(value) => {
            setClassId(value);
            setSectionId(undefined);
            setSearch("");
          }}
        />

        <Select
          placeholder={hasSections ? "Select Section" : "No Section Available"}
          style={{ width: "100%" }}
          value={sectionId}
          disabled={!classId || !hasSections}
          onChange={(value) => setSectionId(value)}
          options={sections.map((item: any) => ({
            label: item.name,
            value: item.id,
          }))}
        />

        <Input.Search
          allowClear
          placeholder="Search student, father name, phone, or roll number"
          style={{ width: "100%" }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: 18,
        }}
      >
        <Statistic
          title="Students shown"
          value={filteredStudents.length}
          styles={{ content: { color: "#1d4ed8", fontWeight: 800 } }}
        />
        {classId ? (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 14,
              color: "#1e3a8a",
              padding: "12px 14px",
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Ready for fee operations
            </Text>
            <Text type="secondary">
              Review the fee history below and use "Add Fee" only for the selected student.
            </Text>
          </div>
        ) : null}
      </div>

      {!classId ? (
        <Empty description="Select a class to load students" />
      ) : hasSections && !sectionId ? (
        <Empty description="Select a section to continue" />
      ) : filteredStudents.length === 0 && !studentsLoading ? (
        <Empty description="No students match the selected class, section, or search" />
      ) : (
        <FeeTable students={filteredStudents} loading={studentsLoading} />
      )}
    </Card>
  );
}

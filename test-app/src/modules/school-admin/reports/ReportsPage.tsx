"use client";

import { Button, Card, Empty, Select, Space, Typography } from "antd";
import { useMemo, useState } from "react";

import { useGetTeachersQuery } from "../api/teacherApi";
import { useGetClassesQuery } from "../classes/classes";
import { useGetAllStudentsByClassQuery } from "../fees/studentApi";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";

const { Paragraph, Title } = Typography;

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();

  const { data: teachers = [], isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsByClassQuery(classId || "", {
    skip: !classId,
  });
  const { data: students = [], isLoading: studentsLoading } =
    useGetAllStudentsByClassQuery(
      {
        classId: classId!,
        sectionId: sectionId || undefined,
      },
      {
        skip: !classId,
      },
    );

  const studentExportRows = useMemo(
    () =>
      students.map((student: any) => ({
        Name: student.name || "",
        RollNumber: student.rollNumber || "",
        FatherName: student.fatherName || "",
        ParentPhone: student.parentPhone || "",
        Class: student.className || "",
        Section: student.sectionName || "",
      })),
    [students],
  );

  const teacherExportRows = useMemo(
    () =>
      teachers.map((teacher) => ({
        EmployeeId: teacher.employeeId || "",
        FirstName: teacher.firstName || "",
        LastName: teacher.lastName || "",
        Email: teacher.email || "",
        Phone: teacher.phone || "",
        Qualification: teacher.qualification || "",
        Status: teacher.status || "",
      })),
    [teachers],
  );

  return (
    <Card title="Basic Reports">
      <Title level={4}>Export school data for demo and office review</Title>
      <Paragraph>
        These exports help school staff quickly take student and teacher lists into
        Excel or print them for review.
      </Paragraph>

      <Space wrap style={{ marginBottom: 20 }}>
        <Select
          allowClear
          placeholder="Filter students by class"
          style={{ width: 220 }}
          value={classId}
          options={classes.map((item) => ({
            label: item.name,
            value: item._id,
          }))}
          onChange={(value) => {
            setClassId(value);
            setSectionId(undefined);
          }}
        />

        <Select
          allowClear
          placeholder="Filter by section"
          style={{ width: 220 }}
          disabled={!classId}
          value={sectionId}
          options={sections.map((item) => ({
            label: item.name,
            value: item._id,
          }))}
          onChange={(value) => setSectionId(value)}
        />
      </Space>

      <Space wrap>
        <Button
          loading={teachersLoading}
          onClick={() => downloadCsv("teachers-report.csv", teacherExportRows)}
          disabled={teacherExportRows.length === 0}
        >
          Export Teachers CSV
        </Button>

        <Button
          loading={studentsLoading}
          onClick={() => downloadCsv("students-report.csv", studentExportRows)}
          disabled={studentExportRows.length === 0}
        >
          Export Students CSV
        </Button>

        <Button onClick={() => window.print()}>Print This Page</Button>
      </Space>

      {!teacherExportRows.length && !studentExportRows.length ? (
        <Empty
          style={{ marginTop: 24 }}
          description="No report data is available yet for export"
        />
      ) : null}
    </Card>
  );
}

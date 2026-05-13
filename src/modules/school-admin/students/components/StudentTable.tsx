"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import React, { useEffect, useMemo, useState } from "react";

import { Avatar, Card, Empty, Grid, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetStudentsQuery } from "../studentApi";

import type { StudentPopulated } from "@/shared-types/student.types";

import StudentRowActions from "./StudentRowActions";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface Props {
  classId: string | null;
  sectionId: string | null;
  search: string;
}

function StudentTable({ classId, sectionId, search }: Props) {
  const [page, setPage] = useState(1);
  const screens = useBreakpoint();
  const isCompact = !screens.lg;

  useEffect(() => {
    setPage(1);
  }, [classId, sectionId, search]);

  const { data, isLoading } = useGetStudentsQuery(
    {
      classId: classId || undefined,
      page,
      limit: 10,
      search: search || undefined,
      sectionId: sectionId || undefined,
    },
    {
    },
  );

  const students = data?.data || [];
  // Some student endpoints historically returned `students` instead of `data`,
  // so we keep a fallback to avoid an empty table when the API shape changes.
  const fallbackStudents = (data as { students?: StudentPopulated[] } | undefined)
    ?.students;
  const total = data?.total || 0;

  useEffect(() => {
    const handleStudentsUpdated = () => {
      setPage(1);
    };

    window.addEventListener("students-updated", handleStudentsUpdated);

    return () => {
      window.removeEventListener("students-updated", handleStudentsUpdated);
    };
  }, []);

  /* ================= COLUMNS ================= */

  const columns = useMemo<ColumnsType<StudentPopulated>>(
    () => [
      {
        title: "Photo",
        render: (_, record) => (
          <Avatar style={{ backgroundColor: "#1677ff" }}>
            {record.firstName?.[0]?.toUpperCase()}
          </Avatar>
        ),
      },
      {
        title: "Student Name",
        render: (_, record) => `${record.firstName} ${record.lastName || ""}`,
      },
      {
        title: "Class",
        render: (_, record) => (
          <Tag color="blue">{record.classId?.name || "-"}</Tag>
        ),
      },
      {
        title: "Section",
        render: (_, record) => (
          <Tag color="purple">{record.sectionId?.name || "-"}</Tag>
        ),
      },
      {
        title: "Roll No",
        dataIndex: "rollNumber",
      },
      {
        title: "Parent Phone",
        dataIndex: "parentPhone",
      },
      {
        title: "Actions",
        render: (_, record) => <StudentRowActions record={record} />,
      },
    ],
    [],
  );

  const renderCompactCard = useMemo(
    () => (record: StudentPopulated) => (
      <Card
        key={record._id}
        size="small"
        style={{
          borderRadius: 18,
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
          marginBottom: 12,
        }}
        styles={{ body: { padding: 14 } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar style={{ backgroundColor: "#1677ff", flex: "0 0 auto" }}>
            {record.firstName?.[0]?.toUpperCase()}
          </Avatar>

          <div style={{ minWidth: 0, flex: 1 }}>
            <Text strong style={{ display: "block" }}>
              {record.firstName} {record.lastName || ""}
            </Text>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              <Tag color="blue">{record.classId?.name || "-"}</Tag>
              <Tag color="purple">{record.sectionId?.name || "-"}</Tag>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <Text type="secondary">Roll No: {record.rollNumber || "-"}</Text>
          <Text type="secondary">Parent Phone: {record.parentPhone || "-"}</Text>
        </div>

        <div style={{ marginTop: 12 }}>
          <StudentRowActions record={record} />
        </div>
      </Card>
    ),
    [],
  );

  return (
    <>
      {isCompact ? (
        <>
          {(students.length ? students : fallbackStudents || []).map(renderCompactCard)}
          {!(students.length || fallbackStudents?.length) ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No students found for the selected filters"
            />
          ) : null}
        </>
      ) : (
        <ResponsiveTable
          rowKey="_id"
          columns={columns}
          dataSource={students.length ? students : fallbackStudents || []}
          loading={isLoading}
          scroll={{ y: 400 }}
          pagination={{
            total,
            current: page,
            pageSize: 10,
            onChange: setPage,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No students found for the selected filters"
              />
            ),
          }}
        />
      )}
    </>
  );
}

export default React.memo(StudentTable);

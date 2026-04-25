"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import React, { useEffect, useMemo, useState } from "react";

import { Avatar, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetStudentsQuery } from "../studentApi";

import type { StudentPopulated } from "@/shared-types/student.types";

import StudentRowActions from "./StudentRowActions";

interface Props {
  classId: string | null;
  sectionId: string | null;
  search: string;
}

function StudentTable({ classId, sectionId, search }: Props) {
  const [page, setPage] = useState(1);

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
      refetchOnMountOrArgChange: true,
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

  return (
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
    />
  );
}

export default React.memo(StudentTable);

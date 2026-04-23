"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import React, { useMemo, useState } from "react";

import { Avatar, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { useGetStudentsQuery } from "../studentApi";

import type { StudentPopulated } from "../../../../../../shared-types/student.types";

import StudentRowActions from "./StudentRowActions";

function StudentTable() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetStudentsQuery(
    { page, limit: 10 },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const students = data?.data || [];
  const total = data?.total || 0;

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
      dataSource={students}
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

"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { Button, Grid, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { StudentDTO } from "@/shared-types/student.types";
import FeeDrawer from "./FeeDrawer";
import FeeHistoryTable from "./FeeHistoryTable";

type FeeStudent = StudentDTO & {
  className?: string;
  sectionName?: string;
  classId?: string;
  sectionId?: string;
  parentPhone?: string;
  fatherName?: string;
};

const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function FeeTable({
  students = [],
  loading,
}: {
  students: FeeStudent[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeStudent | null>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<FeeStudent> = [
    {
      title: "#",
      width: 60,
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
    },

    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <Text strong>{text}</Text>,
    },

    {
      title: "Father Name",
      dataIndex: "fatherName",
      render: (text) => <Text>{text || "-"}</Text>,
    },

    {
      title: "Class",
      render: (_, row: FeeStudent) => (
        <Tag color="blue">
          {row.className} - {row.sectionName}
        </Tag>
      ),
    },

    {
      title: "Phone",
      dataIndex: "parentPhone",
      render: (text) => <Text type="secondary">{text || "-"}</Text>,
    },

    {
      title: "Action",
      align: "right",
      render: (_, row) => (
        <Button
          type="primary"
          size={isMobile ? "middle" : "large"}
          style={{
            borderRadius: 6,
            paddingInline: isMobile ? 12 : 18,
          }}
          onClick={() => {
            setSelectedStudent(row);
            setOpen(true);
          }}
        >
          Add Fee
        </Button>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <>
      <ResponsiveTable
        rowKey="_id"
        dataSource={students}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 8 }}
        expandable={{
          expandedRowRender: (record: FeeStudent) => (
            <FeeHistoryTable student={record} />
          ),
        }}
      />

      {selectedStudent ? (
        <FeeDrawer
          open={open}
          onClose={() => setOpen(false)}
          student={selectedStudent}
        />
      ) : null}
    </>
  );
}


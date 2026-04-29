"use client";

import { App, Button, Modal, Space, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";

import { TeacherAssignment } from "@/shared-types/teacherAssignment.types";
import { useDeleteTeacherAssignmentMutation } from "../teacherAssignment.api";

interface Props {
  data: TeacherAssignment[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function TeacherAssignmentsTable({
  data = [],
  loading,
  page,
  total,
  onPageChange,
}: Props) {
  const { message, modal } = App.useApp();
  const [deleteAssignment] = useDeleteTeacherAssignmentMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (rawId: any, forceDelete: boolean = false) => {
    if (deletingId) return;

    const id = String(rawId?._id || rawId);

    try {
      setDeletingId(id);
      await deleteAssignment({ id, forceDelete }).unwrap();
      message.success("Assignment deleted successfully");
      onPageChange(page);
    } catch (error: any) {
      const err = error?.data || error;

      if (err?.requiresConfirmation) {
        Modal.destroyAll();

        return modal.confirm({
          title: "Warning",
          content:
            err.message || "This subject is used in timetable. Delete anyway?",
          okText: "Yes, Delete",
          cancelText: "Cancel",
          okType: "danger",
          onOk: async () => {
            try {
              await deleteAssignment({
                id,
                forceDelete: true,
              }).unwrap();

              message.success("Deleted successfully");
              onPageChange(page);
            } catch {
              // The shared API layer already handles the error toast.
            }
          },
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<TeacherAssignment> = [
    {
      title: "#",
      width: 60,
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: "Teacher",
      render: (_, row) => {
        const teacher = row.teacherId;

        if (!teacher?._id) {
          return <Tag color="red">Unknown</Tag>;
        }

        return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
      },
    },
    {
      title: "Subject",
      render: (_, row) =>
        row.subjectId?.name || <Tag color="orange">No Subject</Tag>,
    },
    {
      title: "Class",
      render: (_, row) => row.classId?.name || <Tag>—</Tag>,
    },
    {
      title: "Academic Year",
      render: (_, row) =>
        row.academicYear?.name || row.academicYearId || <Tag>—</Tag>,
    },
    {
      title: "Action",
      width: 140,
      render: (_, row) => {
        const id = String(row?._id);

        return (
          <Space>
            <Button
              danger
              size="small"
              loading={deletingId === id}
              onClick={() => handleDelete(id)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Table<TeacherAssignment>
      rowKey="_id"
      columns={columns}
      dataSource={data}
      loading={loading}
      bordered
      size="middle"
      locale={{
        emptyText: "No assignments found",
      }}
      pagination={{
        current: page,
        pageSize: 10,
        total: total || data.length,
        showSizeChanger: false,
        onChange: (nextPage) => onPageChange(nextPage),
      }}
    />
  );
}

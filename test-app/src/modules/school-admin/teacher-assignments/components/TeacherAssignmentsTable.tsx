"use client";

import BrandLoader from "@/src/components/BrandLoader";
import ResponsiveTable from "@/src/components/ResponsiveTable";
import { App, Avatar, Button, Card, Empty, Grid, Pagination, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { memo, useCallback, useMemo, useState } from "react";

import { TeacherAssignment } from "@/shared-types/teacherAssignment.types";
import { useDeleteTeacherAssignmentMutation } from "../teacherAssignment.api";

interface Props {
  data: TeacherAssignment[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

function TeacherAssignmentsTable({
  data = [],
  loading,
  page,
  total,
  onPageChange,
}: Props) {
  const { message, modal } = App.useApp();
  const [deleteAssignment] = useDeleteTeacherAssignmentMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.lg;

  const handleDelete = useCallback(
    async (rawId: any, forceDelete: boolean = false) => {
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
          modal.destroyAll();

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
    },
    [deletingId, deleteAssignment, message, modal, onPageChange, page],
  );

  const columns: ColumnsType<TeacherAssignment> = useMemo(
    () => [
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
            <div style={{ display: "flex" }}>
              <Button
                danger
                size="small"
                loading={deletingId === id}
                onClick={() => handleDelete(id)}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [deletingId, handleDelete, page],
  );

  const renderCompactCard = useMemo(
    () => (row: TeacherAssignment, index: number) => {
      const id = String(row?._id);
      const teacherName = `${row.teacherId?.firstName || ""} ${
        row.teacherId?.lastName || ""
      }`.trim();

      return (
        <Card
          key={id}
          size="small"
          style={{
            borderRadius: 18,
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
            marginBottom: 12,
          }}
          styles={{ body: { padding: 14 } }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              size={42}
              style={{ backgroundColor: "#1677ff", flex: "0 0 auto" }}
            >
              {teacherName?.[0]?.toUpperCase() || "T"}
            </Avatar>

            <div style={{ minWidth: 0, flex: 1 }}>
              <Typography.Text strong style={{ display: "block" }}>
                #{(page - 1) * 10 + index + 1} {teacherName || "Unknown"}
              </Typography.Text>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 6,
                }}
              >
                <Tag color="blue">{row.classId?.name || "No Class"}</Tag>
                <Tag color="purple">{row.subjectId?.name || "No Subject"}</Tag>
                <Tag color="geekblue">
                  {row.academicYear?.name || row.academicYearId || "Academic"}
                </Tag>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Button
              danger
              size="small"
              block
              loading={deletingId === id}
              onClick={() => handleDelete(id)}
            >
              Delete
            </Button>
          </div>
        </Card>
      );
    },
    [deletingId, handleDelete, page],
  );

  return (
    <>
      {isCompact ? (
        <div>
          {loading && !data.length ? (
            <div style={{ minHeight: 160, display: "grid", placeItems: "center" }}>
              <BrandLoader compact />
            </div>
          ) : data.length ? (
            <div>
              {data.map((row, index) => renderCompactCard(row, index))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No assignments found"
            />
          )}

          {total > 10 ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
              <Pagination
                current={page}
                pageSize={10}
                total={total || data.length}
                onChange={(nextPage) => onPageChange(nextPage)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <ResponsiveTable
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
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
      )}
    </>
  );
}

export default memo(TeacherAssignmentsTable);

"use client";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Grid, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import BrandLoader from "@/src/components/BrandLoader";
import ResponsiveTable from "@/src/components/ResponsiveTable";
import { showToast } from "@/src/utils/toast";
import { IExam } from "@/shared-types/exam.types";
import { useGetAcademicYearsQuery } from "../academic-year/academicYear.api";
import CreateExamScreen from "./CreateExamScreen";
import {
  useDeleteExamMutation,
  useGetExamsQuery,
  usePublishExamMutation,
} from "./exam.api";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function ExamActionButtons({
  record,
  onSchedule,
  onAdmitCards,
  onEdit,
  onPublish,
  onDelete,
}: {
  onAdmitCards: (record: IExam) => void;
  onDelete: (id: string) => void;
  onEdit: (record: IExam) => void;
  onPublish: (id: string) => void;
  onSchedule: (record: IExam) => void;
  record: IExam;
}) {
  return (
    <Space wrap>
      <Tooltip title="Add or edit exam schedule">
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => onSchedule(record)}
        />
      </Tooltip>

      <Tooltip title="Preview or release admit cards">
        <Button icon={<IdcardOutlined />} onClick={() => onAdmitCards(record)} />
      </Tooltip>

      <Tooltip title="Edit exam details">
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
      </Tooltip>

      {!record.isPublished ? (
        <Tooltip title="Publish exam">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => onPublish(record._id)}
          />
        </Tooltip>
      ) : null}

      <Tooltip title="Delete exam">
        <Popconfirm title="Delete exam?" onConfirm={() => onDelete(record._id)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Tooltip>
    </Space>
  );
}

export default function ExamListScreen() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isCompact = !screens.xl;

  const { data = [], isLoading } = useGetExamsQuery();
  const [deleteExam] = useDeleteExamMutation();
  const [publishExam] = usePublishExamMutation();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<IExam | null>(null);
  const { data: academicYears = [] } = useGetAcademicYearsQuery();
  const activeYearName =
    academicYears.find((item) => item.isActive)?.name || "Active academic year";

  const handleEdit = useCallback((record: IExam) => {
    setEditData(record);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      showToast.success("Exam deleted");
    } catch {
      showToast.error("Delete failed");
    }
  }, [deleteExam]);

  const handlePublish = useCallback(async (id: string) => {
    try {
      await publishExam(id).unwrap();
      showToast.success("Exam published");
    } catch (err: any) {
      showToast.error(err?.data?.message || "Publish failed");
    }
  }, [publishExam]);

  const handleSchedule = useCallback((record: IExam) => {
    router.push(`/school-admin/exams/${record._id}/schedule`);
  }, [router]);

  const handleAdmitCards = useCallback((record: IExam) => {
    router.push(`/school-admin/exams/${record._id}/admit-cards`);
  }, [router]);

  const columns = useMemo(
    () => [
      {
        title: "#",
        render: (_: any, __: IExam, i: number) => i + 1,
        width: 64,
      },
      {
        title: "Exam",
        dataIndex: "name",
        render: (value: string) => <Text strong>{value}</Text>,
      },
      {
        title: "Marks",
        dataIndex: "totalMarks",
        width: 110,
        render: (value: number) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: "Duration",
        width: 180,
        render: (record: IExam) => (
          <Tag color="purple">
            {dayjs(record.startDate).format("DD MMM")} →{" "}
            {dayjs(record.endDate).format("DD MMM")}
          </Tag>
        ),
      },
      {
        title: "Status",
        width: 120,
        render: (record: IExam) =>
          record.isPublished ? <Tag color="green">✓ Published</Tag> : <Tag color="orange">Draft</Tag>,
      },
      {
        title: "Actions",
        width: 240,
        render: (_: any, record: IExam) => (
          <ExamActionButtons
            record={record}
            onAdmitCards={handleAdmitCards}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onPublish={handlePublish}
            onSchedule={handleSchedule}
          />
        ),
      },
    ],
    [handleAdmitCards, handleDelete, handleEdit, handlePublish, handleSchedule],
  );

  const renderCompactCard = (record: IExam) => (
    <Card
      key={record._id}
      size="small"
      variant="borderless"
      style={{
        borderRadius: 18,
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
      }}
      styles={{ body: { padding: 14 } }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 16, display: "block" }}>
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Academic exam
            </Text>
          </div>
          {record.isPublished ? (
            <Tag color="green">✓ Published</Tag>
          ) : (
            <Tag color="orange">Draft</Tag>
          )}
        </div>

        <Space wrap size={8}>
          <Tag color="blue">{record.totalMarks} Marks</Tag>
          <Tag color="purple">
            {dayjs(record.startDate).format("DD MMM")} →{" "}
            {dayjs(record.endDate).format("DD MMM")}
          </Tag>
        </Space>

        <ExamActionButtons
          record={record}
          onAdmitCards={handleAdmitCards}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onSchedule={handleSchedule}
        />
      </div>
    </Card>
  );

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Tag color="blue">Academic Year: {activeYearName}</Tag>
      </div>

      {isCompact ? (
        <div style={{ display: "grid", gap: 12 }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", minHeight: 180 }}>
              <BrandLoader compact />
            </div>
          ) : null}
          {data.map((item: IExam) => renderCompactCard(item))}
          {!isLoading && data.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No exams created yet"
            />
          ) : null}
        </div>
      ) : (
        <ResponsiveTable
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No exams created yet"
              />
            ),
          }}
        />
      )}

      <CreateExamScreen
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
        editData={editData}
      />
    </>
  );
}

"use client";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IExam } from "@/shared-types/exam.types";
import CreateExamScreen from "./CreateExamScreen";
import { showToast } from "@/src/utils/toast";
import { getAcademicYears } from "../academic-year/academicYear.api";

import {
  useDeleteExamMutation,
  useGetExamsQuery,
  usePublishExamMutation,
} from "./exam.api";

const ExamListScreen = () => {
  const router = useRouter();

  /* ✅ RTK */
  const { data = [], isLoading } = useGetExamsQuery();

  const [deleteExam] = useDeleteExamMutation();
  const [publishExam] = usePublishExamMutation();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<IExam | null>(null);
  const [activeYearName, setActiveYearName] = useState("Active academic year");

  useEffect(() => {
    const sync = async () => {
      try {
        const years = await getAcademicYears();
        const active = years.find((item: any) => item.isActive);
        if (active?.name) {
          setActiveYearName(active.name);
        }
      } catch {
        setActiveYearName("Active academic year");
      }
    };

    sync();
  }, []);

  /* ================= ACTIONS ================= */

  const handleEdit = (record: IExam) => {
    setEditData(record);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam(id).unwrap();
      showToast.success("Exam deleted");
    } catch {
      showToast.error("Delete failed");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishExam(id).unwrap();
      showToast.success("Exam published");
    } catch (err: any) {
      showToast.error(err?.data?.message || "Publish failed");
    }
  };

  const handleSchedule = (record: IExam) => {
    router.push(`/school-admin/exams/${record._id}/schedule`);
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "#",
      render: (_: any, __: IExam, i: number) => i + 1,
      width: 60,
    },
    {
      title: "Exam",
      dataIndex: "name",
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>,
    },
    {
      title: "Marks",
      dataIndex: "totalMarks",
      render: (m: number) => (
        <Tag color="blue" style={{ borderRadius: 6 }}>
          {m}
        </Tag>
      ),
    },
    {
      title: "Duration",
      render: (r: IExam) => (
        <Tag color="purple">
          {dayjs(r.startDate).format("DD MMM")} →{" "}
          {dayjs(r.endDate).format("DD MMM")}
        </Tag>
      ),
    },
    {
      title: "Status",
      render: (r: IExam) =>
        r.isPublished ? (
          <Tag color="green">✔ Published</Tag>
        ) : (
          <Tag color="orange">Draft</Tag>
        ),
    },
    {
      title: "Actions",
      render: (_: any, record: IExam) => (
        <Space>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => handleSchedule(record)}
          />

          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />

          {!record.isPublished && (
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handlePublish(record._id)}
            />
          )}

          <Popconfirm
            title="Delete exam?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Tag color="blue">Academic Year: {activeYearName}</Tag>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />

      <CreateExamScreen
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
        editData={editData}
      />
    </>
  );
};

export default ExamListScreen;


"use client";

import {
  BookOutlined,
  IdcardOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Grid,
  Empty,
  Modal,
  Space,
  Tag,
  Table,
  Tooltip,
  Typography,
  App,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BrandLoader from "@/src/components/BrandLoader";
import { useGetExamsQuery } from "./exam.api";
import {
  useGetAdmitCardStudentsQuery,
  usePreviewAdmitCardMutation,
  useReleaseAdmitCardsMutation,
} from "./admitCard.api";
import { showToast } from "@/src/utils/toast";
import { APP_ENV } from "@/src/config/env";

const { Title, Text } = Typography;

const resolvePdfUrl = (pdfUrl?: string | null) => {
  if (!pdfUrl) return "";
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `${APP_ENV.SERVER_URL}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
};

export default function AdmitCardPage({ examId }: { examId: string }) {
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const { message } = App.useApp();
  const { data: exams = [] } = useGetExamsQuery();
  const { data: students = [], isFetching, refetch } = useGetAdmitCardStudentsQuery(examId, {
    skip: !examId,
  });
  const [previewAdmitCard] = usePreviewAdmitCardMutation();
  const [releaseAdmitCards, { isLoading: releasing }] = useReleaseAdmitCardsMutation();

  const currentExam = useMemo(
    () => exams.find((item) => item._id === examId),
    [exams, examId],
  );

  const releasedCount = students.filter((item) => item.status === "released").length;

  const [previewing, setPreviewing] = useState(false);
  const [previewImageLoading, setPreviewImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const isMobile = !screens.md;

  const resolvePreviewUrl = (url?: string | null) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${APP_ENV.SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const derivePreviewImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (/\/previews\//i.test(url)) return resolvePreviewUrl(url);

    const fileName = url.split("/").pop() || "";
    const pngName = fileName.replace(/\.pdf$/i, ".png");
    return resolvePreviewUrl(`/admit-cards/previews/${pngName}`);
  };

  const preloadImage = (src: string) =>
    new Promise<string>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error("Preview image could not be loaded"));
      img.src = src;
    });

  const handlePreview = async (studentId: string) => {
    try {
      setPreviewing(true);
      setPreviewImageLoading(true);
      setPreviewVisible(true);
      const res = await previewAdmitCard({ examId, studentId }).unwrap();
      const previewPayload = (res as any)?.data || res;
      const url = derivePreviewImageUrl(previewPayload?.previewUrl || previewPayload?.pdfUrl);
      console.log("[AdmitCardPreview]", res);
      await preloadImage(url);
      setPreviewImage(url);
      setPreviewImageLoading(false);
      message.success("Preview opened");
    } catch (error: any) {
      setPreviewVisible(false);
      setPreviewImage(null);
      setPreviewImageLoading(false);
      showToast.apiError(error, "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const handleRelease = async () => {
    try {
      const res = await releaseAdmitCards({ examId }).unwrap();
      message.success(`Released ${res.count} admit cards`);
      refetch();
    } catch (error: any) {
      showToast.apiError(error, "Release failed");
    }
  };

  const columns = [
    {
      title: "#",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Student",
      render: (_: any, row: any) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text strong>{row.studentName}</Text>
          <Text type="secondary">{row.fatherName}</Text>
        </div>
      ),
    },
    {
      title: "Roll No",
      dataIndex: "rollNumber",
      render: (value: string | number) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Class",
      dataIndex: "className",
    },
    {
      title: "Section",
      dataIndex: "sectionName",
    },
    {
      title: "Status",
      render: (_: any, row: any) =>
        row.status === "released" ? (
          <Tag color="green">Released</Tag>
        ) : (
          <Tag color="orange">Draft</Tag>
        ),
    },
    {
      title: "Action",
      render: (_: any, row: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handlePreview(row._id)} loading={previewing}>
            Preview
          </Button>
          {row.pdfUrl ? (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => window.open(resolvePdfUrl(row.pdfUrl), "_blank", "noopener,noreferrer")}
            >
              View PDF
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  if (!currentExam && exams.length > 0) {
    return (
      <Card>
        <Empty description="Exam not found" />
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: 18,
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
        maxWidth: "100%",
      }}
      styles={{ body: { padding: isMobile ? 14 : 20 } }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <Space align="start" size={14} style={{ maxWidth: "100%" }}>
          <div
            style={{
              alignItems: "center",
              background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)",
              borderRadius: 16,
              color: "#2563eb",
              display: "flex",
              height: 44,
              justifyContent: "center",
              width: 44,
              flexShrink: 0,
            }}
          >
            <IdcardOutlined />
          </div>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Admit Cards
            </Title>
            <Text type="secondary">
              Preview one student, then approve and release all cards for this exam.
            </Text>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag color="blue">{currentExam?.name || "Exam"}</Tag>
              <Tag color="geekblue">{currentExam?.examType || "Type"}</Tag>
              {currentExam?.startDate && currentExam?.endDate ? (
                <Tag color="purple">
                  {dayjs(currentExam.startDate).format("DD MMM")} → {dayjs(currentExam.endDate).format("DD MMM")}
                </Tag>
              ) : null}
            </div>
          </div>
        </Space>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Tag color="green">Released: {releasedCount}</Tag>
          <Tag color="blue">Total: {students.length}</Tag>
          <Tooltip title={currentExam?.isPublished ? "Release admit cards" : "Publish exam first, then release admit cards"}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleRelease}
              loading={releasing}
              disabled={students.length === 0 || !currentExam?.isPublished}
            >
              Approve & Release
            </Button>
          </Tooltip>
        </div>
      </div>

      <div style={{ marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button onClick={() => router.push("/school-admin/exams")}>Back to Exams</Button>
        <Button type="default" icon={<BookOutlined />} onClick={() => refetch()} loading={isFetching}>
          Refresh
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={students}
        columns={columns}
        pagination={false}
        scroll={{ x: 880 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No admit card candidates found for this exam"
            />
          ),
        }}
      />

      <Modal
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewImage(null);
          setPreviewImageLoading(false);
        }}
        footer={null}
        width={isMobile ? "100vw" : 1180}
        style={{ top: isMobile ? 0 : 12, paddingBottom: 0 }}
        styles={{
          body: {
            padding: 0,
            background: "#fff",
            position: "relative",
            minHeight: isMobile ? "100vh" : "90vh",
            maxHeight: isMobile ? "100vh" : "90vh",
            overflow: "auto",
          },
        }}
        destroyOnHidden
      >
        {previewImage ? (
          <div
            style={{
              alignItems: "center",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "center",
              minHeight: isMobile ? "100vh" : "90vh",
              padding: isMobile ? 8 : 14,
              width: "100%",
            }}
          >
            <img
              key={previewImage}
              src={previewImage}
              alt="Admit card preview"
              style={{
                display: "block",
                width: isMobile ? "100%" : "min(1040px, 100%)",
                maxWidth: "100%",
                height: "auto",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
              }}
            />
          </div>
        ) : null}
        {previewing || previewImageLoading ? (
          <div
            style={{
              inset: 0,
              alignItems: "center",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "center",
              minHeight: isMobile ? "100vh" : "90vh",
              position: "absolute",
            }}
          >
            <BrandLoader compact />
          </div>
        ) : null}
      </Modal>

    </Card>
  );
}

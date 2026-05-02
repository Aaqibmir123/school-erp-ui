"use client";

import { FileDoneOutlined } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { memo, useMemo, useState } from "react";

import BrandLoader from "@/src/components/BrandLoader";
import { APP_ENV } from "@/src/config/env";
import { WEB_THEME } from "@/src/theme/tokens";
import { showToast } from "@/src/utils/toast";

import {
  useGetMidTermMarksCardPreviewQuery,
  useToggleMarksCardApprovalMutation,
} from "./marksCards.api";

const { Title, Text } = Typography;

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const resolveAssetUrl = (value?: string | null) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${APP_ENV.SERVER_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

function MarksCardsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const { modal } = App.useApp();

  const queryArg = useMemo(
    () => (selectedStudentId ? { studentId: selectedStudentId } : undefined),
    [selectedStudentId],
  );

  const { data, isLoading, isFetching, error } = useGetMidTermMarksCardPreviewQuery(
    queryArg as any,
  );
  const [toggleMarksCardApproval, { isLoading: approving }] =
    useToggleMarksCardApprovalMutation();

  const preview = data?.data;
  const studentCards = preview?.students || [];
  const activeStudentId = selectedStudentId;
  const marksCardApproved = preview?.exam?.marksCardStatus === "approved";
  const canToggleApproval = Boolean(preview?.exam?._id);
  const previewImageUrl = resolveAssetUrl(preview?.exam?.previewUrl || preview?.exam?.pdfUrl);
  const pdfUrl = resolveAssetUrl(preview?.exam?.pdfUrl);
  const previewLoading = Boolean(selectedStudentId) && isFetching && Boolean(preview);
  const showInitialLoading = isLoading && !preview;
  const showPreviewError = Boolean(error) && !preview;

  const handleToggleApproval = async () => {
    if (!preview?.exam?._id) return;

    try {
      const targetApproved = !marksCardApproved;
      const res = await toggleMarksCardApproval({
        examId: preview.exam._id,
        approved: targetApproved,
      }).unwrap();

      showToast.success(
        res.message || (targetApproved ? "Marks sheet approved" : "Marks sheet approval revoked"),
      );
    } catch (error: any) {
      showToast.apiError(error, "Marks sheet approval failed");
    }
  };

  const confirmToggleApproval = () => {
    if (!preview?.exam?._id) return;

    const targetApproved = !marksCardApproved;

    modal.confirm({
      title: targetApproved ? "Approve marks sheet?" : "Revoke marks sheet approval?",
      content: targetApproved
        ? "Are you sure to approve it? Approved marks sheet will be visible for release flow."
        : "Are you sure to revoke it? This will move the marks sheet back to draft.",
      okText: targetApproved ? "Approve" : "Revoke",
      cancelText: "Cancel",
      onOk: handleToggleApproval,
    });
  };

  if (showInitialLoading) {
    return (
      <Card
        variant="borderless"
        style={{
          borderRadius: 20,
          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
          minHeight: 240,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            minHeight: 180,
          }}
        >
          <BrandLoader compact />
        </div>
      </Card>
      );
  }

  if (showPreviewError) {
    return (
      <Card
        variant="borderless"
        style={{
          borderRadius: 20,
          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
        }}
        styles={{ body: { padding: 18 } }}
      >
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
            border: "1px solid rgba(191,219,254,0.7)",
            borderRadius: 16,
            display: "flex",
            gap: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "rgba(37,99,235,0.08)",
              borderRadius: 999,
              color: WEB_THEME.colors.primary,
              display: "inline-flex",
              height: 40,
              justifyContent: "center",
              width: 40,
            }}
          >
            <FileDoneOutlined />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              Mid Term marks sheet not available
            </div>
            <Text type="secondary" style={{ display: "block", marginTop: 3 }}>
              Save real marks for the Mid Term exam, then use Preview.
            </Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card
        variant="borderless"
        style={{
          borderRadius: 20,
          boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
        }}
        styles={{ body: { padding: 18 } }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Space align="center" size={12} wrap>
            <div
              style={{
                alignItems: "center",
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                borderRadius: 14,
                color: WEB_THEME.colors.primary,
                display: "inline-flex",
                height: 42,
                justifyContent: "center",
                width: 42,
              }}
            >
              <FileDoneOutlined />
            </div>
            <div>
              <Title level={4} style={{ marginBottom: 0, marginTop: 0 }}>
                Marks Cards
              </Title>
              <Text type="secondary">Mid Term marks sheet preview</Text>
            </div>
            <Tag color="blue">Students {studentCards.length || 0}</Tag>
          </Space>

          <Space wrap>
            <Tag color={marksCardApproved ? "green" : "orange"}>
              {marksCardApproved ? "Approved" : "Draft"}
            </Tag>
            <Button
              type="primary"
              onClick={confirmToggleApproval}
              loading={approving}
              disabled={!canToggleApproval || studentCards.length === 0}
            >
              {marksCardApproved ? "Revoke Marks Sheet" : "Approve Marks Sheet"}
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={9}>
          <Card
            title="Choose student"
            variant="borderless"
            style={{ borderRadius: 20, boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)" }}
            styles={{ body: { padding: 14 } }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              {studentCards.length ? (
                studentCards.map((student) => {
                  const isActive = activeStudentId === student._id;

                  return (
                    <div
                      key={student._id}
                      style={{
                        alignItems: "center",
                        background: isActive ? "rgba(37,99,235,0.06)" : "#fff",
                        border: `1px solid ${isActive ? "rgba(37,99,235,0.28)" : "rgba(226,232,240,0.9)"}`,
                        borderRadius: 16,
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "auto 1fr auto",
                        padding: 12,
                      }}
                    >
                      {student.photo ? (
                        <Avatar size={42} src={resolveAssetUrl(student.photo)} />
                      ) : (
                        <Avatar size={42} style={{ background: "#dbeafe", color: WEB_THEME.colors.primary }}>
                          {getInitials(student.name)}
                        </Avatar>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{student.name}</div>
                        <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                          Roll {student.rollNumber} - Class {student.className} - Section {student.sectionName}
                        </Text>
                        <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 2 }}>
                          {student.percentage}% - {student.grade}
                        </Text>
                      </div>

                      <Button
                        type={isActive ? "primary" : "default"}
                        size="small"
                        onClick={() => setSelectedStudentId(student._id)}
                      >
                        Preview
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: 14 }}>
                  <Text type="secondary">No Mid Term students available yet.</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 20,
              boxShadow: "0 16px 34px rgba(15, 23, 42, 0.06)",
              overflow: "hidden",
            }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Space wrap>
                  <Button
                    onClick={() => {
                      if (previewImageUrl) window.open(previewImageUrl, "_blank", "noopener,noreferrer");
                    }}
                    disabled={!previewImageUrl}
                  >
                    Open Preview
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      if (pdfUrl) window.open(pdfUrl, "_blank", "noopener,noreferrer");
                    }}
                    disabled={!pdfUrl}
                  >
                    Open PDF
                  </Button>
                </Space>
              </div>

              {previewLoading ? (
                <div
                  style={{
                    alignItems: "center",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                    border: "1px solid rgba(226,232,240,0.95)",
                    borderRadius: 18,
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 320,
                  }}
                >
                  <BrandLoader compact />
                </div>
              ) : previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Marks card preview"
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    border: "1px solid rgba(226,232,240,0.95)",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    alignItems: "center",
                    border: "1px dashed rgba(191,219,254,0.95)",
                    borderRadius: 18,
                    color: "#64748b",
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 320,
                    padding: 18,
                    textAlign: "center",
                  }}
                >
                  Select a student and tap Preview to render the marks sheet.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default memo(MarksCardsPage);

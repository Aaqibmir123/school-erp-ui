"use client";

import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  NotificationOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useEffect } from "react";

import { showToast } from "@/src/utils/toast";
import { useGetAcademicYearsQuery } from "../assign-subject/teacherAssignment.api";
import {
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
  useGetNoticesQuery,
  useUpdateNoticeMutation,
} from "./notice.api";

const { Paragraph, Text } = Typography;

const audienceOptions = [
  { label: "Students & Parents", value: "Students & Parents" },
  { label: "Students", value: "Students" },
  { label: "Parents", value: "Parents" },
  { label: "Teachers", value: "Teachers" },
  { label: "All School Users", value: "All School Users" },
];

export default function NoticesPage() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>();
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  const { data: academicYears = [], isLoading: yearsLoading } = useGetAcademicYearsQuery();
  const { data: items = [], isLoading: noticesLoading } = useGetNoticesQuery(
    selectedAcademicYearId ? { academicYearId: selectedAcademicYearId } : undefined,
  );
  const [createNotice, { isLoading: creating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: updating }] = useUpdateNoticeMutation();
  const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();

  const handleCreate = async (values: {
    academicYearId?: string;
    title: string;
    body: string;
    audience: string;
  }) => {
    try {
      const payload = {
        title: values.title.trim(),
        body: values.body.trim(),
        audience: values.audience.trim(),
        academicYearId: values.academicYearId,
      };

      const res = editingNoticeId
        ? await updateNotice({ id: editingNoticeId, data: payload }).unwrap()
        : await createNotice(payload).unwrap();

      showToast.apiResponse(
        res,
        editingNoticeId ? "Notice updated successfully" : "Notice created successfully",
      );
      form.resetFields();
      setEditingNoticeId(null);
      setOpen(false);
    } catch (error) {
      showToast.apiError(
        error,
        editingNoticeId ? "Unable to update notice" : "Unable to create notice",
      );
    }
  };

  const openCreateModal = () => {
    setEditingNoticeId(null);
    setOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingNoticeId(item._id);
    setOpen(true);
  };

  const getAudienceColor = (audience: string) => {
    if (audience === "Teachers") return "#0f766e";
    if (audience === "Parents") return "#7c3aed";
    if (audience === "Students") return "#1d4ed8";
    if (audience === "Students & Parents") return "#2563eb";
    return "#b45309";
  };

  useEffect(() => {
    if (!open) return;

    if (editingNoticeId) {
      const selected = items.find((item) => item._id === editingNoticeId);
      if (!selected) return;

      form.setFieldsValue({
        academicYearId: selected.academicYearId?._id,
        title: selected.title,
        body: selected.body,
        audience: selected.audience,
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      academicYearId: academicYears.find((year) => year.isActive)?._id ?? undefined,
      audience: "Students & Parents",
    });
  }, [academicYears, editingNoticeId, form, items, open]);

  return (
    <Card
      title="School Notices"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Create Notice
        </Button>
      }
      styles={{
        body: { padding: 24 },
        header: { borderBottom: "1px solid #eef2ff", paddingInline: 24 },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "14px 16px",
            background: "#ffffff",
            minWidth: 220,
            flex: "1 1 280px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Notice Overview
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>
              {items.length}
            </div>
            <div style={{ color: "#475569", fontSize: 14 }}>
              notices available
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 16,
            background: "#fff",
            minWidth: 280,
            flex: "1 1 360px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }}>
            Filter Notices
          </div>
          <Select
            allowClear
            placeholder="Filter by academic year"
            value={selectedAcademicYearId}
            loading={yearsLoading}
            size="large"
            style={{ width: "100%" }}
            options={academicYears.map((year) => ({
              label: `${year.name}${year.isActive ? " (Active)" : ""}`,
              value: year._id,
            }))}
            onChange={(value) => setSelectedAcademicYearId(value)}
          />
        </div>
      </div>

      {items.length === 0 && !noticesLoading ? (
        <Empty description="No notices found for this school" />
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((item) => (
            <Col xs={24} md={12} xl={8} key={item._id}>
              <Card
                loading={noticesLoading}
                styles={{
                  body: {
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  },
                }}
                style={{
                  borderRadius: 24,
                  borderColor: "rgba(255,255,255,0.55)",
                  height: "100%",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(248,250,252,0.72) 100%)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <Space wrap size={[8, 8]}>
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: 999,
                        padding: "6px 12px",
                        border: "none",
                        color: getAudienceColor(item.audience),
                        background: "rgba(255,255,255,0.78)",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <TeamOutlined />
                      {item.audience}
                    </Tag>
                  </Space>

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background:
                        "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(167,139,250,0.18) 100%)",
                      color: "#1d4ed8",
                      flexShrink: 0,
                    }}
                  >
                    <NotificationOutlined style={{ fontSize: 18 }} />
                  </div>
                </div>

                <Space wrap size={[8, 8]} style={{ marginBottom: 12 }}>
                  {item.academicYearId?.name ? (
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: 999,
                        padding: "6px 12px",
                        border: "none",
                        background: "rgba(139,92,246,0.10)",
                        color: "#7c3aed",
                        fontWeight: 700,
                      }}
                    >
                      {item.academicYearId.name}
                    </Tag>
                  ) : null}
                </Space>

                <Typography.Title
                  level={4}
                  style={{
                    marginBottom: 10,
                    fontSize: 18,
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </Typography.Title>

                <Paragraph
                  style={{
                    color: "#475569",
                    minHeight: 0,
                    marginBottom: 14,
                    whiteSpace: "pre-wrap",
                    fontSize: 15,
                    lineHeight: 1.7,
                  }}
                >
                  {item.body}
                </Paragraph>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 12,
                    flexWrap: "wrap",
                    marginTop: 8,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(148,163,184,0.14)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CalendarOutlined style={{ color: "#64748b" }} />
                    <Text type="secondary">
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </div>

                  <Space size={10}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(item)}
                      style={{
                        borderRadius: 999,
                        minWidth: 96,
                        height: 40,
                        borderColor: "#dbe7ff",
                        boxShadow: "none",
                      }}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete notice?"
                      okButtonProps={{ loading: deleting }}
                      onConfirm={async () => {
                        try {
                          const res = await deleteNotice(item._id).unwrap();
                          showToast.apiResponse(res, "Notice deleted successfully");
                        } catch (error) {
                          showToast.apiError(error, "Unable to delete notice");
                        }
                      }}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        style={{
                          borderRadius: 999,
                          minWidth: 110,
                          height: 40,
                          boxShadow: "none",
                        }}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingNoticeId ? "Edit Notice" : "Create Notice"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingNoticeId(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreate}
          initialValues={{
            academicYearId:
              academicYears.find((year) => year.isActive)?._id ?? undefined,
            audience: "Students & Parents",
          }}
        >
          <Form.Item label="Academic Year" name="academicYearId">
            <Select
              allowClear
              placeholder="Select academic year"
              loading={yearsLoading}
              options={academicYears.map((year) => ({
                label: `${year.name}${year.isActive ? " (Active)" : ""}`,
                value: year._id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Enter notice title" }]}
          >
            <Input placeholder="School holiday notice" />
          </Form.Item>

          <Form.Item
            label="Audience"
            name="audience"
            rules={[{ required: true, message: "Select audience" }]}
          >
            <Select options={audienceOptions} />
          </Form.Item>

          <Form.Item
            label="Notice Text"
            name="body"
            rules={[{ required: true, message: "Enter notice text" }]}
          >
            <Input.TextArea rows={5} placeholder="Write the notice here" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={creating || updating}
          >
            {editingNoticeId ? "Update Notice" : "Save Notice"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}

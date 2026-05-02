"use client";

import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Dropdown,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { APP_ENV } from "@/src/config/env";
import { showToast } from "@/src/utils/toast";
import AssignSubjectModal from "../assign-subject/AssignSubjectModal";

interface Teacher {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  status?: "active" | "inactive";
}

interface Props {
  teachers: Teacher[];
  loading: boolean;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: string) => Promise<void> | void;
  onRefresh?: () => void;
}

const { Text } = Typography;

function TeachersTable({
  teachers,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [isCompact, setIsCompact] = useState(false);

  const [viewModal, setViewModal] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({
    open: false,
    teacher: null,
  });

  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({
    open: false,
    teacher: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({
    open: false,
    teacher: null,
  });

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setIsCompact(window.innerWidth < 992);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const getImageUrl = useCallback((fileName?: string) => {
    if (!fileName) return undefined;
    if (/^https?:\/\//i.test(fileName) || fileName.startsWith("data:")) {
      return fileName;
    }

    return `${APP_ENV.SERVER_URL}${fileName.startsWith("/") ? "" : "/"}${fileName}`;
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm.teacher?._id || !onDelete || deleting) return;

    setDeleting(true);

    try {
      await onDelete(deleteConfirm.teacher._id);
      setDeleteConfirm({ open: false, teacher: null });
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirm.teacher, deleting, onDelete]);

  const handleActionClick = useCallback(
    (action: string, teacher: Teacher) => {
      switch (action) {
        case "view":
          setViewModal({ open: true, teacher });
          break;
        case "assign":
          setAssignModal({ open: true, teacher });
          break;
        case "assignments":
          router.push(`/school-admin/teacher-assignments/${teacher._id}`);
          break;
        case "edit":
          if (onEdit) {
            onEdit(teacher);
          } else {
            showToast.error("Edit function not configured");
          }
          break;
        case "delete":
          if (onDelete) {
            setDeleteConfirm({ open: true, teacher });
          } else {
            showToast.error("Delete function not configured");
          }
          break;
        default:
          break;
      }
    },
    [onDelete, onEdit, router],
  );

  const handleActionClick = useCallback(
    (action: string, teacher: Teacher) => {
      switch (action) {
        case "view":
          setViewModal({ open: true, teacher });
          break;
        case "assign":
          setAssignModal({ open: true, teacher });
          break;
        case "assignments":
          router.push(`/school-admin/teacher-assignments/${teacher._id}`);
          break;
        case "edit":
          if (onEdit) {
            onEdit(teacher);
          } else {
            showToast.error("Edit function not configured");
          }
          break;
        case "delete":
          if (onDelete) {
            setDeleteConfirm({ open: true, teacher });
          } else {
            showToast.error("Delete function not configured");
          }
          break;
        default:
          break;
      }
    },
    [onDelete, onEdit, router],
  );

  const columns = useMemo(
    () => [
      {
        title: "#",
        width: 60,
        fixed: "left" as const,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Profile",
        width: 80,
        render: (teacher: Teacher) => {
          const imageUrl = getImageUrl(teacher.profileImage);
          const initial = teacher.firstName?.charAt(0)?.toUpperCase();

          return (
            <Avatar
              size={44}
              src={imageUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: !imageUrl ? "#1890ff" : undefined,
                fontWeight: 600,
              }}
            >
              {!imageUrl && initial}
            </Avatar>
          );
        },
      },
      {
        title: "Employee ID",
        dataIndex: "employeeId",
        width: 130,
      },
      {
        title: "Name",
        render: (teacher: Teacher) => (
          <div>
            <strong style={{ fontSize: 14 }}>
              {teacher.firstName} {teacher.lastName}
            </strong>
            {teacher.status && (
              <div>
                <Tag
                  color={teacher.status === "active" ? "success" : "default"}
                  style={{ marginTop: 4, fontSize: 11 }}
                >
                  {teacher.status}
                </Tag>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Contact",
        render: (teacher: Teacher) => (
          <div style={{ fontSize: 13 }}>
            {teacher.phone && <div>📞 {teacher.phone}</div>}
            {teacher.email && (
              <div style={{ color: "#666", marginTop: 2 }}>
                ✉️ {teacher.email}
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Qualification",
        dataIndex: "qualification",
        ellipsis: true,
        width: 150,
      },
      {
        title: "Actions",
        width: 80,
        fixed: "right" as const,
        render: (teacher: Teacher) => {
          const items = [
            {
              key: "view",
              icon: <EyeOutlined />,
              label: "View Profile",
            },
            {
              key: "assign",
              icon: <EditOutlined style={{ color: "#722ed1" }} />,
              label: "Assign Subject",
            },
            {
              key: "assignments",
              icon: <EyeOutlined />,
              label: "View Assignments",
            },
            { type: "divider" as const },
            {
              key: "edit",
              icon: <EditOutlined style={{ color: "#fa8c16" }} />,
              label: "Edit",
            },
            {
              key: "delete",
              icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
              label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
            },
          ];

          return (
            <Dropdown
              menu={{
                items,
                onClick: ({ key }) => handleActionClick(String(key), teacher),
              }}
              placement="bottomRight"
              trigger={["click"]}
              arrow
            >
              <Button
                type="text"
                icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
                style={{ width: 40, height: 40 }}
              />
            </Dropdown>
          );
        },
      },
    ],
    [getImageUrl, handleActionClick],
  );

  const renderViewModal = () => {
    const { teacher } = viewModal;
    if (!teacher) return null;

    const imageUrl = getImageUrl(teacher.profileImage);
    const initial = teacher.firstName?.charAt(0)?.toUpperCase();

    return (
      <Modal
        open={viewModal.open}
        footer={null}
        onCancel={() => setViewModal({ open: false, teacher: null })}
        title="Teacher Profile"
        width={600}
        centered
      >
        <div style={{ textAlign: "center", marginBottom: 24, marginTop: 16 }}>
          <Avatar
            size={100}
            src={imageUrl}
            icon={<UserOutlined />}
            style={{
              backgroundColor: !imageUrl ? "#1890ff" : undefined,
              fontSize: 36,
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {!imageUrl && initial}
          </Avatar>

          <h2 style={{ marginTop: 16, marginBottom: 4 }}>
            {teacher.firstName} {teacher.lastName}
          </h2>

          <Tag color="blue" style={{ fontSize: 13, padding: "4px 12px" }}>
            {teacher.employeeId}
          </Tag>
        </div>

        <Descriptions
          column={1}
          bordered
          styles={{
            label: { width: 140, fontWeight: 600 },
            content: { background: "#fafafa" },
          }}
        >
          <Descriptions.Item label="Email">
            {teacher.email || <span style={{ color: "#999" }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {teacher.phone || <span style={{ color: "#999" }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Qualification">
            {teacher.qualification || <span style={{ color: "#999" }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Experience">
            {teacher.experience || <span style={{ color: "#999" }}>—</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {teacher.address || <span style={{ color: "#999" }}>—</span>}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setViewModal({ open: false, teacher: null });
                if (onEdit) {
                  onEdit(teacher);
                } else {
                  showToast.error("Edit function not configured");
                }
              }}
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => {
                setViewModal({ open: false, teacher: null });
                setAssignModal({ open: true, teacher });
              }}
              style={{ background: "#722ed1", color: "#fff", border: "none" }}
            >
              Assign Subject
            </Button>
          </Space>
        </div>
      </Modal>
    );
  };

  const renderCompactCard = useCallback(
    (teacher: Teacher, index: number) => {
      const imageUrl = getImageUrl(teacher.profileImage);
      const initial = teacher.firstName?.charAt(0)?.toUpperCase();

      return (
        <Card
          key={teacher._id}
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
              size={44}
              src={imageUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: !imageUrl ? "#1890ff" : undefined,
                fontWeight: 600,
              }}
            >
              {!imageUrl && initial}
            </Avatar>

            <div style={{ minWidth: 0, flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                #{index + 1} • {teacher.employeeId}
              </Text>
              <strong style={{ fontSize: 15 }}>
                {teacher.firstName} {teacher.lastName}
              </strong>
              {teacher.status ? (
                <div style={{ marginTop: 6 }}>
                  <Tag
                    color={teacher.status === "active" ? "success" : "default"}
                    style={{ borderRadius: 999, margin: 0 }}
                  >
                    {teacher.status}
                  </Tag>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
            {teacher.phone ? <Text type="secondary">📞 {teacher.phone}</Text> : null}
            {teacher.email ? <Text type="secondary">✉️ {teacher.email}</Text> : null}
            {teacher.qualification ? (
              <Text type="secondary">Qualification: {teacher.qualification}</Text>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Button size="small" onClick={() => handleActionClick("view", teacher)}>
              View
            </Button>
            <Button size="small" onClick={() => handleActionClick("assign", teacher)}>
              Assign
            </Button>
            <Button size="small" onClick={() => handleActionClick("assignments", teacher)}>
              Assignments
            </Button>
            <Button size="small" onClick={() => handleActionClick("edit", teacher)}>
              Edit
            </Button>
            <Button danger size="small" onClick={() => handleActionClick("delete", teacher)}>
              Delete
            </Button>
          </div>
        </Card>
      );
    },
    [getImageUrl, handleActionClick],
  );

  return (
    <>
      {isCompact ? (
        <div>
          {teachers.map((teacher, index) => renderCompactCard(teacher, index))}
        </div>
      ) : (
        <ResponsiveTable
          rowKey="_id"
          columns={columns}
          dataSource={teachers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number) => `Total ${total} teachers`,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      )}

      {renderViewModal()}

      <AssignSubjectModal
        open={assignModal.open}
        teacher={assignModal.teacher ?? { _id: "", firstName: "", lastName: "" }}
        onClose={() => setAssignModal({ open: false, teacher: null })}
      />

      <Modal
        title="Confirm Delete"
        open={deleteConfirm.open}
        onOk={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, teacher: null })}
        confirmLoading={deleting}
        okText="Delete"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>
            {deleteConfirm.teacher?.firstName} {deleteConfirm.teacher?.lastName}
          </strong>
          ?
        </p>
        <p style={{ color: "#666", fontSize: 13 }}>
          This action cannot be undone. All associated data will be permanently
          removed.
        </p>
      </Modal>
    </>
  );
}

export default TeachersTable;

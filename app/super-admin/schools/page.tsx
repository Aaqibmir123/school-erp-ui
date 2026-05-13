"use client";

import { Button, Card, Empty, Grid, Table, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useSuperAdminSchools } from "@/src/modules/super-admin/hooks/useSuperAdminSchools";
import { showToast } from "@/src/utils/toast";

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function SchoolsPage() {
  const { handleApprove, handleStatus, loading, refetch, schools } =
    useSuperAdminSchools();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const statusColor = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    if (status === "APPROVED") return "green";
    if (status === "PENDING") return "gold";
    return "red";
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card
        variant="borderless"
        style={{
          borderRadius: 24,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            alignItems: isMobile ? "flex-start" : "center",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 16,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Schools
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              Review new requests, disable inactive schools, or reactivate them when needed.
            </Paragraph>
          </div>

          <Button
            block={isMobile}
            icon={<ReloadOutlined />}
            onClick={() => void refetch()}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </Card>

      <Card variant="borderless" title="All Schools">
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 12 }}>
            {schools.length ? (
              schools.map((school) => (
                <Card key={school._id} size="small" style={{ borderRadius: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 10 }}>
                    <div>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        {school.schoolName}
                      </Title>
                      <Tag color={statusColor(school.status)}>{school.status}</Tag>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <strong>{school.principalName}</strong>
                      <span>{school.email}</span>
                      <span>{school.phone}</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 8 }}>
                      {school.status === "PENDING" && (
                        <Button
                          type="primary"
                          block
                          onClick={async () => {
                            try {
                              await handleApprove(school._id);
                              showToast.success("School approved");
                            } catch (error) {
                              showToast.apiError(error, "Could not approve school");
                            }
                          }}
                        >
                          Approve
                        </Button>
                      )}

                      {school.status === "REJECTED" ? (
                        <Button
                          icon={<CheckCircleOutlined />}
                          block
                          onClick={async () => {
                            try {
                              await handleStatus(school._id, "APPROVED");
                              showToast.success("School activated");
                            } catch (error) {
                              showToast.apiError(error, "Could not activate school");
                            }
                          }}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          danger
                          icon={<CloseCircleOutlined />}
                          block
                          onClick={async () => {
                            try {
                              await handleStatus(school._id, "REJECTED");
                              showToast.warning("School disabled");
                            } catch (error) {
                              showToast.apiError(error, "Could not disable school");
                            }
                          }}
                        >
                          Disable
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Empty description="No schools found" />
            )}
          </div>
        ) : (
          <Table
            rowKey="_id"
            loading={loading}
            dataSource={schools}
            locale={{ emptyText: <Empty description="No schools found" /> }}
            columns={[
              { title: "School", dataIndex: "schoolName" },
              { title: "Principal", dataIndex: "principalName" },
              { title: "Email", dataIndex: "email" },
              { title: "Phone", dataIndex: "phone" },
              {
                title: "Status",
                dataIndex: "status",
                render: (status: string) => (
                  <Tag
                    color={
                      status === "APPROVED"
                        ? "green"
                        : status === "PENDING"
                          ? "gold"
                          : "red"
                    }
                  >
                    {status}
                  </Tag>
                ),
              },
                  {
                    title: "Actions",
                    render: (_: unknown, record: { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" }) => (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {record.status === "PENDING" && (
                          <Button
                            type="primary"
                        onClick={async () => {
                          try {
                            await handleApprove(record._id);
                            showToast.success("School approved");
                          } catch (error) {
                            showToast.apiError(error, "Could not approve school");
                          }
                        }}
                      >
                        Approve
                      </Button>
                    )}

                    {record.status === "REJECTED" ? (
                      <Button
                        icon={<CheckCircleOutlined />}
                        onClick={async () => {
                          try {
                            await handleStatus(record._id, "APPROVED");
                            showToast.success("School activated");
                          } catch (error) {
                            showToast.apiError(error, "Could not activate school");
                          }
                        }}
                      >
                        Activate
                      </Button>
                    ) : (
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={async () => {
                          try {
                            await handleStatus(record._id, "REJECTED");
                            showToast.warning("School disabled");
                          } catch (error) {
                            showToast.apiError(error, "Could not disable school");
                          }
                        }}
                          >
                            Disable
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  );
}

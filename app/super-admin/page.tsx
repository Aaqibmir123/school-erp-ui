"use client";

import { useMemo } from "react";

import { Button, Card, Col, Empty, Row, Statistic, Table, Tag, Typography, Grid } from "antd";
import {
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { useSuperAdminSchools } from "@/src/modules/super-admin/hooks/useSuperAdminSchools";
import { showToast } from "@/src/utils/toast";

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AdminDashboard() {
  const { counts, handleApprove, handleStatus, loading, pendingSchools, refetch, schools } =
    useSuperAdminSchools();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const recentSchools = schools.slice(0, 6);

  const summaryCards = useMemo(
    () => [
      { title: "Total Schools", value: counts.total },
      { title: "Pending Requests", value: counts.pending },
      { title: "Active Schools", value: counts.active },
      { title: "Disabled Schools", value: counts.disabled },
    ],
    [counts.active, counts.disabled, counts.pending, counts.total],
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card
        variant="borderless"
        style={{
          borderRadius: 24,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <div style={{ alignItems: "flex-start", display: "flex", gap: 16 }}>
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)",
                  borderRadius: 20,
                  color: "#2563EB",
                  display: "flex",
                  height: 56,
                  justifyContent: "center",
                  width: 56,
                }}
              >
                <BankOutlined style={{ fontSize: 22 }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Super Admin Dashboard
                </Title>
                <Paragraph style={{ marginBottom: 0 }}>
                  Monitor new school requests, active schools, and quick account status changes from one place.
                </Paragraph>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={10}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              <Button icon={<ReloadOutlined />} onClick={() => void refetch()} loading={loading}>
                Refresh
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {isMobile ? (
        <div style={{ display: "grid", gap: 12 }}>
          {summaryCards.map((card) => (
            <Card key={card.title} variant="borderless">
              <Statistic title={card.title} value={card.value} />
            </Card>
          ))}
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <Card variant="borderless">
              <Statistic title="Total Schools" value={counts.total} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card variant="borderless">
              <Statistic title="Pending Requests" value={counts.pending} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card variant="borderless">
              <Statistic title="Active Schools" value={counts.active} />
            </Card>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Card variant="borderless">
              <Statistic title="Disabled Schools" value={counts.disabled} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            variant="borderless"
            title="New School Requests"
            extra={<Text type="secondary">{pendingSchools.length} awaiting review</Text>}
          >
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 12 }}>
                {pendingSchools.length ? (
                  pendingSchools.map((school: any) => (
                    <Card key={school._id} size="small">
                      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 4 }}>
                        <strong>{school.schoolName}</strong>
                        <Text type="secondary">{school.principalName}</Text>
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
                      </div>
                    </Card>
                  ))
                ) : (
                  <Empty description="No new requests right now" />
                )}
              </div>
            ) : (
              <Table
                rowKey="_id"
                loading={loading}
                dataSource={pendingSchools}
                pagination={false}
                locale={{ emptyText: <Empty description="No new requests right now" /> }}
                columns={[
                  { title: "School", dataIndex: "schoolName" },
                  { title: "Principal", dataIndex: "principalName" },
                  {
                    title: "Action",
                    render: (_: unknown, record: { _id: string }) => (
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
                    ),
                  },
                ]}
                scroll={{ x: 520 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            variant="borderless"
            title="Latest Schools"
            extra={<Text type="secondary">Recent status overview</Text>}
          >
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 12 }}>
                {recentSchools.length ? (
                  recentSchools.map((school: any) => (
                    <Card key={school._id} size="small">
                      <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: 6 }}>
                        <strong>{school.schoolName}</strong>
                        <Tag
                          color={
                            school.status === "APPROVED"
                              ? "green"
                              : school.status === "PENDING"
                                ? "gold"
                                : "red"
                          }
                        >
                          {school.status}
                        </Tag>
                        {school.status === "PENDING" ? (
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
                        ) : school.status === "REJECTED" ? (
                          <Button
                            block
                            icon={<CheckCircleOutlined />}
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
                            block
                            icon={<CloseCircleOutlined />}
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
                    </Card>
                  ))
                ) : (
                  <Empty description="No schools yet" />
                )}
              </div>
            ) : (
              <Table
                rowKey="_id"
                loading={loading}
                dataSource={recentSchools}
                pagination={false}
                locale={{ emptyText: <Empty description="No schools yet" /> }}
                columns={[
                  { title: "School", dataIndex: "schoolName" },
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
                    title: "Action",
                    render: (_: unknown, record: { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" }) => (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {record.status === "PENDING" ? (
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
                        ) : record.status === "REJECTED" ? (
                          <Button
                            type="default"
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
                scroll={{ x: 680 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

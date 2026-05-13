"use client";

import {
  CarOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { showToast } from "@/src/utils/toast";
import {
  useCreateTransportMutation,
  useDeleteTransportMutation,
  useGetTransportsQuery,
  useUpdateTransportMutation,
} from "./transport.api";
import type {
  TransportPayload,
  TransportRecord,
  TransportRecordStatus,
  TransportSalaryStatus,
  TransportVehicleType,
} from "@/shared-types/transport.types";

const { Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const vehicleOptions: Array<{ label: string; value: TransportVehicleType }> = [
  { label: "Bus", value: "bus" },
  { label: "Van", value: "van" },
  { label: "Car", value: "car" },
  { label: "Mini Bus", value: "mini-bus" },
  { label: "Other", value: "other" },
];

const statusOptions: Array<{ label: string; value: TransportRecordStatus }> = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const salaryStatusOptions: Array<{ label: string; value: TransportSalaryStatus }> = [
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Pending", value: "pending" },
];

const getVehicleLabel = (value?: TransportVehicleType) =>
  vehicleOptions.find((option) => option.value === value)?.label || "Bus";

function TransportDrawer({
  open,
  record,
  onClose,
}: {
  open: boolean;
  record: TransportRecord | null;
  onClose: () => void;
}) {
  const [form] = Form.useForm<TransportPayload>();
  const screens = useBreakpoint();
  const [createTransport, createState] = useCreateTransportMutation();
  const [updateTransport, updateState] = useUpdateTransportMutation();

  const isEdit = Boolean(record);
  const loading = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;

    if (record) {
      form.setFieldsValue({
        capacity: record.capacity,
        driverName: record.driverName,
        driverPhone: record.driverPhone,
        driverSalary: record.driverSalary,
        notes: record.notes,
        routeName: record.routeName,
        salaryPaidAmount: record.salaryPaidAmount,
        salaryStatus: record.salaryStatus,
        status: record.status,
        vehicleNumber: record.vehicleNumber,
        vehicleType: record.vehicleType,
      });
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      status: "active",
      salaryStatus: "pending",
      salaryPaidAmount: 0,
      vehicleType: "bus",
    });
  }, [form, open, record]);

  const handleSubmit = async (values: TransportPayload) => {
    try {
      if (isEdit && record) {
        await updateTransport({
          id: record._id,
          data: values,
        }).unwrap();
        showToast.success("Transport updated successfully");
      } else {
        await createTransport(values).unwrap();
        showToast.success("Transport added successfully");
      }
      onClose();
    } catch (error) {
      showToast.apiError(error, "Unable to save transport");
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit transport" : "Add transport"}
      size={screens.md ? "large" : "default"}
      destroyOnClose
      styles={{
        body: {
          background: "#F8FAFC",
          paddingBottom: 16,
          paddingTop: 12,
        },
      }}
      footer={
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()} loading={loading}>
            {isEdit ? "Update Transport" : "Save Transport"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
          padding: 20,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Route name"
              name="routeName"
              rules={[{ required: true, message: "Route name is required" }]}
            >
              <Input placeholder="Main City Route" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Vehicle number"
              name="vehicleNumber"
              rules={[{ required: true, message: "Vehicle number is required" }]}
            >
              <Input placeholder="AB-1234" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Vehicle type"
              name="vehicleType"
              rules={[{ required: true, message: "Vehicle type is required" }]}
            >
              <Select options={vehicleOptions} placeholder="Select vehicle" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Capacity"
              name="capacity"
              rules={[{ required: true, message: "Capacity is required" }]}
            >
              <InputNumber min={1} placeholder="42" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Driver name"
              name="driverName"
              rules={[{ required: true, message: "Driver name is required" }]}
            >
              <Input placeholder="Muhammad Imran" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Driver phone"
              name="driverPhone"
              rules={[{ required: true, message: "Driver phone is required" }]}
            >
              <Input placeholder="0300-1234567" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Monthly salary"
              name="driverSalary"
              rules={[{ required: true, message: "Driver salary is required" }]}
            >
              <InputNumber min={0} placeholder="25000" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Salary paid amount" name="salaryPaidAmount">
              <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Payment status"
              name="salaryStatus"
              rules={[{ required: true, message: "Payment status is required" }]}
            >
              <Select options={salaryStatusOptions} placeholder="Select status" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Record status"
              name="status"
              rules={[{ required: true, message: "Record status is required" }]}
            >
              <Select options={statusOptions} placeholder="Select record status" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Notes" name="notes">
              <Input.TextArea
                rows={4}
                placeholder="Optional route notes, pickup points, or remarks"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

function TransportPage() {
  const { data: transports = [], isLoading, isFetching } = useGetTransportsQuery();
  const [deleteTransport] = useDeleteTransportMutation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportRecord | null>(null);

  const summary = useMemo(() => {
    const active = transports.filter((item) => item.status === "active").length;
    const salaryDue = transports.reduce(
      (total, item) => total + Number(item.salaryDueAmount || 0),
      0,
    );

    return { active, salaryDue };
  }, [transports]);

  const handleAdd = () => {
    setSelectedTransport(null);
    setDrawerOpen(true);
  };

  const handleEdit = (transport: TransportRecord) => {
    setSelectedTransport(transport);
    setDrawerOpen(true);
  };

  const handleDelete = async (transportId: string) => {
    try {
      await deleteTransport(transportId).unwrap();
      showToast.success("Transport deleted successfully");
    } catch (error) {
      showToast.apiError(error, "Unable to delete transport");
    }
  };

  const columns = [
    {
      title: "Route",
      render: (_: unknown, record: TransportRecord) => (
        <div>
          <Text strong>{record.routeName}</Text>
          <div>
            <Text type="secondary">
              {record.vehicleNumber} - {getVehicleLabel(record.vehicleType)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Driver",
      render: (_: unknown, record: TransportRecord) => (
        <div>
          <div>{record.driverName}</div>
          <Text type="secondary">{record.driverPhone}</Text>
        </div>
      ),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
    },
    {
      title: "Salary",
      render: (_: unknown, record: TransportRecord) => (
        <div>
          <div>Rs. {Number(record.driverSalary || 0).toLocaleString()}</div>
          <Text type="secondary">
            Paid Rs. {Number(record.salaryPaidAmount || 0).toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: "Payment",
      render: (_: unknown, record: TransportRecord) => (
        <Tag
          color={
            record.salaryStatus === "paid"
              ? "green"
              : record.salaryStatus === "partial"
                ? "gold"
                : "red"
          }
        >
          {record.salaryStatus}
        </Tag>
      ),
    },
    {
      title: "Status",
      render: (_: unknown, record: TransportRecord) => (
        <Tag color={record.status === "active" ? "blue" : "default"}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_: unknown, record: TransportRecord) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography.Title level={2} style={{ marginBottom: 8 }}>
            Transport Management
          </Typography.Title>
          <Paragraph style={{ marginBottom: 0, maxWidth: 760 }}>
            Manage bus and van routes, driver details, salary payment status, and
            operational notes from one place.
          </Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Transport
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}>
          <Card variant="borderless" style={{ borderRadius: 20 }}>
            <Statistic
              title="Total transports"
              value={transports.length}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <Card variant="borderless" style={{ borderRadius: 20 }}>
            <Statistic
              title="Active routes"
              value={summary.active}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <Card variant="borderless" style={{ borderRadius: 20 }}>
            <Statistic
              title="Driver salary due"
              value={`Rs. ${summary.salaryDue.toLocaleString()}`}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        variant="borderless"
        style={{
          borderRadius: 20,
          boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <ResponsiveTable
          rowKey="_id"
          loading={isLoading || isFetching}
          dataSource={transports}
          columns={columns}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No transport routes yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <TransportDrawer
        open={drawerOpen}
        record={selectedTransport}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(TransportPage), {
  ssr: false,
});

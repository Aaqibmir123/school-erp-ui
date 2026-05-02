"use client";

import { APP_ENV } from "@/src/config/env";
import ResponsiveTable from "@/src/components/ResponsiveTable";
import { App, Button, Popconfirm, Space, Tag, Typography } from "antd";
import { useState } from "react";

import {
  useDeleteFeeMutation,
  useGenerateReceiptMutation,
  useGetFeesByStudentQuery,
} from "../feeApi";
import FeeDrawer from "./FeeDrawer";
import { FeeStatusTag } from "./FeeStatusTag";

const { Text } = Typography;

export default function FeeHistoryTable({ student }: any) {
  const { message } = App.useApp();
  const { data: fees = [], isLoading } = useGetFeesByStudentQuery(student._id);

  const [generateReceipt, { isLoading: generating }] =
    useGenerateReceiptMutation();
  const [deleteFee] = useDeleteFeeMutation();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const getReceiptUrl = (pdfUrl?: string) => {
    if (!pdfUrl) return "";
    return pdfUrl.startsWith("http")
      ? pdfUrl
      : `${APP_ENV.SERVER_URL}${pdfUrl}`;
  };

  const handleDelete = async (fee: any) => {
    if (!fee?._id) return message.error("Invalid Fee");

    try {
      await deleteFee({
        id: fee._id,
        studentId: student._id,
      }).unwrap();

      message.success("Fee deleted successfully");
    } catch (err) {
      message.error("Failed to delete fee");
    }
  };

  const handleGenerateReceipt = async (row: any) => {
    try {
      if (row.receiptId && row.pdfUrl) {
        window.open(getReceiptUrl(row.pdfUrl), "_blank");
        return;
      }

      const res = await generateReceipt({
        studentId: student._id,
        feeIds: [row._id],
      }).unwrap();

      message.success("Receipt generated");

      if (res?.data?.pdfUrl) {
        window.open(getReceiptUrl(res.data.pdfUrl), "_blank");
      }
    } catch (err) {
      message.error("Failed to generate receipt");
    }
  };

  const columns = [
    {
      title: "Month",
      width: 110,
      dataIndex: "month",
      render: (m: string) => <Text strong>{m}</Text>,
    },
    {
      title: "Type",
      width: 120,
      dataIndex: "feeType",
      render: (type: string) => (
        <Tag color="blue" style={{ borderRadius: 999, paddingInline: 10 }}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Total",
      width: 100,
      dataIndex: "totalAmount",
      render: (v: number) => <Text>&#8377; {v}</Text>,
    },
    {
      title: "Paid",
      width: 100,
      dataIndex: "paidAmount",
      render: (v: number) => <Text type="success">&#8377; {v}</Text>,
    },
    {
      title: "Remaining",
      width: 110,
      dataIndex: "remainingAmount",
      render: (v: number) => (
        <Text type={v > 0 ? "danger" : "success"} strong>
          &#8377; {v}
        </Text>
      ),
    },
    {
      title: "Paid Date",
      width: 120,
      dataIndex: "paidDate",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Status",
      width: 110,
      render: (row: any) => <FeeStatusTag status={row.status} />,
    },
    {
      title: "Actions",
      width: 250,
      render: (row: any) => (
        <Space wrap size={8}>
          <Button
            size="small"
            type="primary"
            style={{
              borderRadius: 999,
              boxShadow: "0 8px 18px rgba(37, 99, 235, 0.18)",
            }}
            onClick={() => {
              setEditData(row);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Popconfirm title="Delete fee?" onConfirm={() => handleDelete(row)}>
            <Button danger size="small" style={{ borderRadius: 999 }}>
              Delete
            </Button>
          </Popconfirm>

          <Button
            size="small"
            type={row.receiptId ? "default" : "primary"}
            loading={generating}
            disabled={row.status === "unpaid"}
            style={{ borderRadius: 999 }}
            onClick={() => handleGenerateReceipt(row)}
          >
            {row.receiptId ? "View Receipt" : "Generate Receipt"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.06))",
          border: "1px solid rgba(59,130,246,0.12)",
          borderRadius: 16,
          marginBottom: 12,
          padding: 14,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Text strong style={{ color: "#1d4ed8" }}>
            Fee history for {student?.name}
          </Text>
          <Text type="secondary">
            Buttons stay wrapped on smaller screens, so nothing spills outside the card.
          </Text>
        </div>
      </div>

      <ResponsiveTable
        rowKey="_id"
        dataSource={fees}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />

      <FeeDrawer
        open={open}
        onClose={() => setOpen(false)}
        student={student}
        editData={editData}
      />
    </>
  );
}

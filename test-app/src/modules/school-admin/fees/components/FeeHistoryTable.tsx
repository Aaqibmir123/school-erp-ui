"use client";

import { APP_ENV } from "@/src/config/env";
import ResponsiveTable from "@/src/components/ResponsiveTable";
import { Button, Popconfirm, Space, Tag, Typography, message } from "antd";
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

    await deleteFee({
      id: fee._id,
      studentId: student._id,
    });

    message.success("Deleted");
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
      console.error(err);
      message.error("Failed to generate receipt");
    }
  };

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      render: (m: string) => <Text strong>{m}</Text>,
    },
    {
      title: "Type",
      dataIndex: "feeType",
      render: (type: string) => <Tag color="blue">{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (v: number) => <Text>₹ {v}</Text>,
    },
    {
      title: "Paid",
      dataIndex: "paidAmount",
      render: (v: number) => <Text type="success">₹ {v}</Text>,
    },
    {
      title: "Remaining",
      dataIndex: "remainingAmount",
      render: (v: number) => (
        <Text type={v > 0 ? "danger" : "success"} strong>
          ₹ {v}
        </Text>
      ),
    },
    {
      title: "Paid Date",
      dataIndex: "paidDate",
      render: (d: string) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Status",
      render: (row: any) => <FeeStatusTag status={row.status} />,
    },
    {
      title: "Actions",
      render: (row: any) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setEditData(row);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Popconfirm title="Delete fee?" onConfirm={() => handleDelete(row)}>
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>

          {/* 🔥 FINAL BUTTON */}
          <Button
            size="small"
            type={row.receiptId ? "default" : "primary"}
            loading={generating}
            disabled={row.status === "unpaid"}
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

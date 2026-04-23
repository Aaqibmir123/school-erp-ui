"use client";

import { Table, Button, message } from "antd";
import { usePendingSchools } from "@/src/modules/super-admin/hooks/usePendingSchools";

export default function SchoolsPage() {
  const { schools, loading, handleApprove } = usePendingSchools();
  console.log("Pending Schools:", schools);

  const columns = [
    {
      title: "School",
      dataIndex: "schoolName",
    },
    {
      title: "Principal",
      dataIndex: "principalName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          onClick={async () => {
            await handleApprove(record._id);
            message.success("School Approved");
          }}
        >
          Approve
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>New School Requests</h2>

      <Table
        columns={columns}
        dataSource={schools}
        loading={loading}
        rowKey="_id"
      />
    </div>
  );
}

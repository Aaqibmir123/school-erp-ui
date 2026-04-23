"use client";

import { Table } from "antd";
import { useGetClassesQuery } from "../classes";

export default function ClassesList() {
  const { data: classes = [] } = useGetClassesQuery();

  const columns = [
    {
      title: "Class",
      dataIndex: "name",
    },
    {
      title: "Order",
      dataIndex: "order",
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={classes}
      pagination={false}
    />
  );
}

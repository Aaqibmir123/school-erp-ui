"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { memo, useMemo } from "react";

import { useGetClassesQuery } from "../classes";

function ClassesList() {
  const { data: classes = [], isLoading } = useGetClassesQuery();

  const columns = useMemo(
    () => [
      {
        title: "Class",
        dataIndex: "name",
      },
      {
        title: "Order",
        dataIndex: "order",
      },
    ],
    [],
  );

  return (
    <ResponsiveTable
      rowKey="_id"
      columns={columns}
      dataSource={classes}
      loading={isLoading}
      pagination={false}
    />
  );
}

export default memo(ClassesList);

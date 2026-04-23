"use client";

import { Grid, Table } from "antd";

const { useBreakpoint } = Grid;

export default function ResponsiveTable(props: any) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        {...props}
        scroll={{ x: isMobile ? 900 : "max-content" }}
        pagination={{
          ...props.pagination,
          size: isMobile ? "small" : "default",
        }}
      />
    </div>
  );
}

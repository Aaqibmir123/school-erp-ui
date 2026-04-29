"use client";

import { Grid, Table } from "antd";

const { useBreakpoint } = Grid;

export default function ResponsiveTable(props: any) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div style={{ overflow: "hidden", borderRadius: 18 }}>
      <Table
        {...props}
        scroll={{ x: isMobile ? 980 : "max-content" }}
        size={isMobile ? "small" : "middle"}
        tableLayout="fixed"
        pagination={{
          ...props.pagination,
          size: isMobile ? "small" : "default",
        }}
      />
    </div>
  );
}

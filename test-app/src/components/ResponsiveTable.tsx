"use client";

import { Table } from "antd";
import { memo, useEffect, useMemo, useState } from "react";

import BrandLoader from "./BrandLoader";

function ResponsiveTable(props: any) {
  const [isMobile, setIsMobile] = useState(false);
  const { loading, tableLayout, scroll, pagination, ...rest } = props;

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const resolvedPagination = useMemo(() => {
    if (pagination === false) return false;

    return {
      ...pagination,
      size: isMobile ? "small" : pagination?.size || "default",
    };
  }, [isMobile, pagination]);

  const resolvedScroll = useMemo(
    () => ({
      x: isMobile ? 760 : "max-content",
      ...scroll,
    }),
    [isMobile, scroll],
  );

  return (
    <div
      style={{
        borderRadius: 18,
        overflowX: "auto",
        position: "relative",
      }}
    >
      {loading ? (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            minHeight: 220,
            width: "100%",
          }}
        >
          <BrandLoader compact />
        </div>
      ) : (
        <Table
          {...rest}
          scroll={resolvedScroll}
          size={isMobile ? "small" : "middle"}
          tableLayout={tableLayout ?? (isMobile ? "auto" : "fixed")}
          pagination={resolvedPagination}
        />
      )}
    </div>
  );
}

export default memo(ResponsiveTable);

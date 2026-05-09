"use client";

import type { ReactNode } from "react";
import { memo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Col, Empty, Row } from "antd";

import { WEB_THEME } from "@/src/theme/tokens";
import DashboardChartCard from "./DashboardChartCard";
import styles from "./SchoolAdminDashboard.module.css";

const COLORS = [
  WEB_THEME.colors.primary,
  "#0F172A",
  "#16A34A",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

export type FeeTrendPoint = { month: string; collected: number; due: number };
export type NamedValue = { name: string; value: number };

export type DashboardRechartsChartsProps = {
  feeTrend: FeeTrendPoint[];
  revenueMix: NamedValue[];
  transportBreakdown: NamedValue[];
  hasFeeTrend: boolean;
  hasRevenueMix: boolean;
  hasTransport: boolean;
  transportTable: ReactNode;
};

function DashboardRechartsCharts({
  feeTrend,
  revenueMix,
  transportBreakdown,
  hasFeeTrend,
  hasRevenueMix,
  hasTransport,
  transportTable,
}: DashboardRechartsChartsProps) {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <DashboardChartCard title="Fee collection">
            {hasFeeTrend ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={feeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="collected"
                    stroke={WEB_THEME.colors.primary}
                    fill={WEB_THEME.colors.primarySoft}
                    strokeWidth={3}
                    name="Collected"
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="due"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    strokeWidth={3}
                    name="Due"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No fee trend data yet" />
            )}
          </DashboardChartCard>
        </Col>

        <Col xs={24} xl={10}>
          <DashboardChartCard title="Revenue mix">
            {hasRevenueMix ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={revenueMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={70}
                    paddingAngle={4}
                  >
                    {revenueMix.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No financial breakdown yet" />
            )}
          </DashboardChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <DashboardChartCard title="Transport salaries">
            {hasTransport ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={transportBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar isAnimationActive={false} dataKey="value" radius={[12, 12, 0, 0]}>
                    {transportBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No transport records yet" />
            )}
          </DashboardChartCard>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            variant="borderless"
            title="Recent transport records"
            className={styles.tableCard}
          >
            {transportTable}
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default memo(DashboardRechartsCharts);

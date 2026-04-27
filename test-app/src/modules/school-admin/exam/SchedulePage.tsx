"use client";

import { CalendarOutlined } from "@ant-design/icons";
import { Card, Divider, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import AddScheduleForm from "./AddScheduleForm";
import ScheduleList from "./ScheduleList";

import { getAcademicYears } from "../academic-year/academicYear.api";
import { useGetClassesWithSubjectsQuery, useGetExamsQuery } from "./exam.api";

const { Title } = Typography;

const SchedulePage = ({ examId }: { examId: string }) => {
  const { data: res } = useGetClassesWithSubjectsQuery();
  const { data: exams = [] } = useGetExamsQuery();
  const [activeYearName, setActiveYearName] = useState("Active academic year");

  const classes = res || [];
  const currentExam = useMemo(
    () => exams.find((item) => item._id === examId),
    [exams, examId],
  );

  useEffect(() => {
    const sync = async () => {
      try {
        const years = await getAcademicYears();
        const active = years.find((item: any) => item.isActive);
        if (active?.name) {
          setActiveYearName(active.name);
        }
      } catch {
        setActiveYearName("Active academic year");
      }
    };

    sync();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Card
        style={{
          borderRadius: 18,
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
        }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ marginBottom: 18 }}>
          <Space align="start" size={14}>
            <div
              style={{
                alignItems: "center",
                background: "linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)",
                borderRadius: 16,
                color: "#2563eb",
                display: "flex",
                height: 44,
                justifyContent: "center",
                width: 44,
                flexShrink: 0,
              }}
            >
              <CalendarOutlined />
            </div>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Exam Schedule
              </Title>
              <div style={{ color: "#64748b" }}>
                Create and manage schedules by class, subject, and school timings.
              </div>
            </div>
          </Space>

          <Tag color="blue" style={{ marginTop: 12 }}>
            Academic Year: {activeYearName}
          </Tag>
          {currentExam?.examType && (
            <Tag color="geekblue" style={{ marginTop: 12, marginLeft: 8 }}>
              Exam Type: {currentExam.examType}
            </Tag>
          )}
        </div>

        {/* FORM */}
        <AddScheduleForm
          examId={examId}
          examType={currentExam?.examType}
          classes={classes}
        />

        <Divider />

        {/* LIST */}
        <ScheduleList examId={examId} classes={classes} />
      </Card>
    </div>
  );
};

export default SchedulePage;

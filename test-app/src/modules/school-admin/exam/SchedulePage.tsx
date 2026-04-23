"use client";

import { Card, Divider, Typography } from "antd";
import AddScheduleForm from "./AddScheduleForm";
import ScheduleList from "./ScheduleList";

import { useGetClassesWithSubjectsQuery } from "./exam.api";

const { Title } = Typography;

const SchedulePage = ({ examId }: { examId: string }) => {
  const { data: res } = useGetClassesWithSubjectsQuery();

  const classes = res || [];

  return (
    <div style={{ padding: 16 }}>
      <Card style={{ borderRadius: 12 }}>
        <Title level={4}>Exam Schedule</Title>

        {/* FORM */}
        <AddScheduleForm examId={examId} classes={classes} />

        <Divider />

        {/* LIST */}
        <ScheduleList examId={examId} classes={classes} />
      </Card>
    </div>
  );
};

export default SchedulePage;

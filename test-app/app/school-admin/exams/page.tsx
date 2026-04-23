"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { useState } from "react";
import CreateExamScreen from "../../../src/modules/school-admin/exam/CreateExamScreen";
import ExamListScreen from "../../../src/modules/school-admin/exam/ExamListScreens";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    setRefresh((p) => !p);
  };

  return (
    <Card
      title="Exams"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Create Exam
        </Button>
      }
    >
      {/* LIST ALWAYS VISIBLE */}
      <ExamListScreen />

      {/* MODAL FORM */}
      <CreateExamScreen
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </Card>
  );
}

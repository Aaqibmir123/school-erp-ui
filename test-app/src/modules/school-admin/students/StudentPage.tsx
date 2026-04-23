"use client";

import { Button, Card, message } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";

import StudentFilters from "./components/StudentFilters";
import StudentTable from "./components/StudentTable";

import useStudentDrawer from "./hooks/useStudentDrawer";

import { useDownloadTemplateMutation } from "./studentApi";

const StudentDrawer = dynamic(() => import("./components/StudentDrawer"));
const BulkUploadDrawer = dynamic(() => import("./components/BulkUploadDrawer"));

export default function StudentPage() {
  const drawer = useStudentDrawer();

  const [bulkOpen, setBulkOpen] = useState(false);

  // ✅ RTK mutation
  const [downloadTemplate, { isLoading: downloading }] =
    useDownloadTemplateMutation();

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate().unwrap();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "students_template.xlsx";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Template downloaded");
    } catch (error) {
      console.error(error);
      message.error("Template download failed");
    }
  };

  return (
    <Card title="Students">
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Button type="primary" onClick={drawer.openDrawer}>
          Add Student
        </Button>

        <Button onClick={() => setBulkOpen(true)}>Bulk Upload</Button>

        <Button loading={downloading} onClick={handleDownloadTemplate}>
          Download Template
        </Button>
      </div>

      <StudentFilters />

      <StudentTable />

      <StudentDrawer
        open={drawer.open}
        onClose={drawer.closeDrawer}
      />

      <BulkUploadDrawer open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </Card>
  );
}

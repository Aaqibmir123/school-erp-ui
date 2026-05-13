"use client";

import { App, Alert, Button, Card, Empty } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import StudentFilters from "./components/StudentFilters";
import StudentTable from "./components/StudentTable";
import styles from "./StudentPage.module.css";
import useStudentDrawer from "./hooks/useStudentDrawer";

import { useGetClassesQuery } from "../classes/classes";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useDownloadTemplateMutation } from "./studentApi";

const StudentDrawer = dynamic(() => import("./components/StudentDrawer"));
const BulkUploadDrawer = dynamic(() => import("./components/BulkUploadDrawer"));

export default function StudentPage() {
  const { message } = App.useApp();
  const drawer = useStudentDrawer();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data: classes = [],
    isLoading: classesLoading,
    isError: classesError,
  } = useGetClassesQuery();

  const [downloadTemplate, { isLoading: downloading }] =
    useDownloadTemplateMutation();

  const { data: sections = [] } = useGetSectionsByClassQuery(
    selectedClassId || "",
    {
      skip: !selectedClassId,
    },
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        label: item.name,
        value: item._id,
      })),
    [classes],
  );

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        label: section.name,
        value: section._id,
      })),
    [sections],
  );

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
      message.error("Template download failed");
    }
  };

  return (
    <Card title="Students" className={styles.pageCard}>
      <div className={styles.actionsRow}>
        <Button
          type="primary"
          onClick={drawer.openDrawer}
          disabled={classesLoading || classes.length === 0}
        >
          Add Student
        </Button>

        <Button onClick={() => setBulkOpen(true)} disabled={classes.length === 0}>
          Bulk Upload
        </Button>

        <Button loading={downloading} onClick={handleDownloadTemplate}>
          Download Template
        </Button>
      </div>

      {classesError ? (
        <Alert
          type="error"
          showIcon
          message="Unable to load classes"
          description="Please refresh the page and make sure class setup is available before managing students."
          style={{ marginBottom: 16 }}
        />
      ) : null}

      {!classesLoading && classes.length === 0 ? (
        <Empty
          description="No classes are available yet. Create classes first before adding students."
          style={{ marginTop: 24 }}
        />
      ) : (
        <>
          <StudentFilters
            classOptions={classOptions}
            sectionOptions={sectionOptions}
            selectedClassId={selectedClassId}
            selectedSectionId={selectedSectionId}
            search={search}
            onClassChange={(value) => {
              setSelectedClassId(value);
              setSelectedSectionId(null);
            }}
            onSectionChange={setSelectedSectionId}
            onSearchChange={setSearch}
          />

          <StudentTable
            classId={selectedClassId}
            sectionId={selectedSectionId}
            search={debouncedSearch}
          />
        </>
      )}

      <StudentDrawer open={drawer.open} onClose={drawer.closeDrawer} />
      <BulkUploadDrawer open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </Card>
  );
}

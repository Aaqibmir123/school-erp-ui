"use client";

import { Button, Card, message } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import StudentFilters from "./components/StudentFilters";
import StudentTable from "./components/StudentTable";
import styles from "./StudentPage.module.css";

import useStudentDrawer from "./hooks/useStudentDrawer";

import { useDownloadTemplateMutation } from "./studentApi";
import { getClassesApi } from "../classes/api/class.api";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";

type ClassOption = {
  label: string;
  value: string;
};

const StudentDrawer = dynamic(() => import("./components/StudentDrawer"));
const BulkUploadDrawer = dynamic(() => import("./components/BulkUploadDrawer"));

export default function StudentPage() {
  const drawer = useStudentDrawer();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [downloadTemplate, { isLoading: downloading }] =
    useDownloadTemplateMutation();

  const { data: sections = [] } = useGetSectionsByClassQuery(
    selectedClassId || "",
    {
      skip: !selectedClassId,
    },
  );

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        label: section.name,
        value: section._id,
      })),
    [sections],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getClassesApi();
        if (mounted) {
          setClasses(
            res.map((item) => ({
              label: item.name,
              value: item._id,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load classes", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

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
    <Card title="Students" className={styles.pageCard}>
      <div className={styles.actionsRow}>
        <Button type="primary" onClick={drawer.openDrawer}>
          Add Student
        </Button>

        <Button onClick={() => setBulkOpen(true)}>Bulk Upload</Button>

        <Button loading={downloading} onClick={handleDownloadTemplate}>
          Download Template
        </Button>
      </div>

      <StudentFilters
        classOptions={classes}
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

      <StudentDrawer open={drawer.open} onClose={drawer.closeDrawer} />

      <BulkUploadDrawer open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </Card>
  );
}

"use client";

import { Card, Select } from "antd";
import { useEffect, useState } from "react";

import { getClassesApi } from "@/src/modules/school-admin/classes/api/class.api";
import SectionForm from "@/src/modules/school-admin/sections/components/SectionForm";
import SectionList from "@/src/modules/school-admin/sections/components/SectionList";

export default function SectionsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [refresh, setRefresh] = useState(0);

  const loadClasses = async () => {
    const res = await getClassesApi();

    const formatted = res.map((c: any) => ({
      label: c.name,
      value: c._id,
    }));

    setClasses(formatted);

    // AUTO SELECT FIRST CLASS
    if (formatted.length > 0) {
      setClassId(formatted[0].value);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <Card title="Sections">
      <Select
        value={classId}
        options={classes}
        style={{ width: 250, marginBottom: 20 }}
        onChange={(value) => setClassId(value)}
      />

      {classId && (
        <>
          <SectionForm
            classId={classId}
            // onCreated={() => setRefresh((r) => r + 1)}
          />

          <div style={{ marginTop: 20 }} />

          <SectionList />
        </>
      )}
    </Card>
  );
}

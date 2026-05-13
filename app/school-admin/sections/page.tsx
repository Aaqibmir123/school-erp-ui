"use client";

import { Alert, Card, Empty, Select } from "antd";

import { useGetClassesQuery } from "@/src/modules/school-admin/classes/classes";
import SectionForm from "@/src/modules/school-admin/sections/components/SectionForm";
import SectionList from "@/src/modules/school-admin/sections/components/SectionList";
import { useState } from "react";

export default function SectionsPage() {
  const [classId, setClassId] = useState("");
  const {
    data: classes = [],
    isLoading,
    isError,
  } = useGetClassesQuery();

  const classOptions = classes.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  return (
    <Card title="Sections">
      {isError ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Unable to load classes"
          description="Please refresh the page and complete class setup before managing sections."
        />
      ) : null}

      {classes.length === 0 && !isLoading ? (
        <Empty description="No classes available yet. Create classes first." />
      ) : (
        <>
          <Select
            value={classId || undefined}
            placeholder="Select class"
            loading={isLoading}
            options={classOptions}
            style={{ width: 250, marginBottom: 20 }}
            onChange={(value) => setClassId(value)}
          />

          {classId ? (
            <>
              <SectionForm classId={classId} />
              <div style={{ marginTop: 20 }} />
              <SectionList classId={classId} />
            </>
          ) : (
            <Empty description="Select a class to manage sections" />
          )}
        </>
      )}
    </Card>
  );
}

"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { useGetClassesQuery } from "@/src/modules/school-admin/classes/classes";
import {
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
} from "@/src/modules/school-admin/subjects/subject.api";
import { IClassSubjects, ISubject } from "@/shared-types/subject.types";
import { Button, Card, Empty, Grid, Input, Select, Tag, message, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useCallback, useMemo, useState } from "react";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function SubjectsPage() {
  const screens = useBreakpoint();
  const isCompact = !screens.lg;

  const [classId, setClassId] = useState<string>("");
  const [subjectInput, setSubjectInput] = useState("");

  const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: subjectsData = [], isLoading } = useGetSubjectsQuery();

  const [createSubjects, { isLoading: creating }] = useCreateSubjectsMutation();
  const [deleteSubject, { isLoading: deleting }] = useDeleteSubjectMutation();

  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls._id,
        label: cls.name,
      })),
    [classes],
  );

  const handleAddSubjects = useCallback(async () => {
    if (!classId || !subjectInput.trim()) {
      message.warning("Select a class and enter at least one subject");
      return;
    }

    try {
      const subjects = subjectInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!subjects.length) {
        message.warning("Enter at least one subject name");
        return;
      }

      await createSubjects({ classId, subjects }).unwrap();
      message.success("Subjects added successfully");
      setSubjectInput("");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to add subjects");
    }
  }, [classId, createSubjects, subjectInput]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteSubject(id).unwrap();
        message.success("Subject deleted successfully");
      } catch (error: any) {
        message.error(error?.data?.message || "Failed to delete subject");
      }
    },
    [deleteSubject],
  );

  const columns = useMemo<ColumnsType<IClassSubjects>>(
    () => [
      {
        title: "Class",
        dataIndex: "className",
        width: 200,
      },
      {
        title: "Subjects",
        render: (_: unknown, record: IClassSubjects) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {record.subjects.map((subject: ISubject) => (
              <Tag
                key={subject._id}
                color="blue"
                closable={!deleting}
                onClose={(event) => {
                  event.preventDefault();
                  void handleDelete(subject._id);
                }}
                style={{ borderRadius: 999, paddingInline: 10 }}
              >
                {subject.name}
              </Tag>
            ))}
          </div>
        ),
      },
    ],
    [deleting, handleDelete],
  );

  const renderCompactCard = useCallback(
    (record: IClassSubjects) => (
      <Card
        key={record.classId}
        size="small"
        style={{
          borderRadius: 18,
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
          marginBottom: 12,
        }}
        styles={{ body: { padding: 14 } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Text strong style={{ fontSize: 16, display: "block" }}>
              {record.className}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.subjects.length} subject{record.subjects.length === 1 ? "" : "s"}
            </Text>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {record.subjects.length ? (
            record.subjects.map((subject: ISubject) => (
              <Tag
                key={subject._id}
                color="blue"
                closable={!deleting}
                onClose={(event) => {
                  event.preventDefault();
                  void handleDelete(subject._id);
                }}
                style={{ borderRadius: 999, paddingInline: 10 }}
              >
                {subject.name}
              </Tag>
            ))
          ) : (
            <Tag color="default">No subjects</Tag>
          )}
        </div>
      </Card>
    ),
    [deleting, handleDelete],
  );

  return (
    <Card title="Subjects" style={{ borderRadius: 16 }}>
      {classes.length === 0 && !classesLoading ? (
        <Empty description="No classes available yet. Create classes first." />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: isCompact
                ? "1fr"
                : "220px minmax(0, 1fr) auto",
              marginBottom: 24,
            }}
          >
            <Select
              placeholder="Select class"
              loading={classesLoading}
              value={classId || undefined}
              onChange={(value) => setClassId(value)}
              options={classOptions}
              style={{ width: "100%" }}
            />

            <Input
              placeholder="Math, English, Science"
              value={subjectInput}
              onChange={(event) => setSubjectInput(event.target.value)}
            />

            <Button
              type="primary"
              size="large"
              onClick={handleAddSubjects}
              loading={creating}
              style={{ width: isCompact ? "100%" : "auto" }}
            >
              Add Subjects
            </Button>
          </div>

          {isCompact ? (
            <div>
              {subjectsData.length ? (
                subjectsData.map((record) => renderCompactCard(record))
              ) : (
                <Empty description="No subjects have been created yet" />
              )}
            </div>
          ) : (
            <ResponsiveTable
              rowKey="classId"
              columns={columns}
              dataSource={subjectsData}
              loading={isLoading}
              pagination={false}
              bordered
              locale={{
                emptyText: "No subjects have been created yet",
              }}
            />
          )}
        </>
      )}
    </Card>
  );
}

export default memo(SubjectsPage);

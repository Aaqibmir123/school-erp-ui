"use client";

import { Button, Card, Empty, Input, Select, Space, Table, Tag, message } from "antd";
import { useMemo, useState } from "react";

import { IClassSubjects, ISubject } from "@/shared-types/subject.types";
import { useGetClassesQuery } from "@/src/modules/school-admin/classes/classes";
import {
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
} from "@/src/modules/school-admin/subjects/subject.api";

export default function SubjectsPage() {
  const [classId, setClassId] = useState<string>("");
  const [subjectInput, setSubjectInput] = useState("");

  const {
    data: classes = [],
    isLoading: classesLoading,
  } = useGetClassesQuery();
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

  const handleAddSubjects = async () => {
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
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id).unwrap();
      message.success("Subject deleted successfully");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete subject");
    }
  };

  const columns = [
    {
      title: "Class",
      dataIndex: "className",
      width: 200,
    },
    {
      title: "Subjects",
      render: (_: unknown, record: IClassSubjects) => (
        <Space wrap>
          {record.subjects.map((subject: ISubject) => (
            <Tag
              key={subject._id}
              color="blue"
              closable={!deleting}
              onClose={(event) => {
                event.preventDefault();
                void handleDelete(subject._id);
              }}
            >
              {subject.name}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Card title="Subjects" style={{ borderRadius: 10 }}>
      {classes.length === 0 && !classesLoading ? (
        <Empty description="No classes available yet. Create classes first." />
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 25 }}>
            <Select
              placeholder="Select class"
              style={{ width: 220 }}
              loading={classesLoading}
              value={classId || undefined}
              onChange={(value) => setClassId(value)}
              options={classOptions}
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
            >
              Add Subjects
            </Button>
          </div>

          <Table<IClassSubjects>
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
        </>
      )}
    </Card>
  );
}

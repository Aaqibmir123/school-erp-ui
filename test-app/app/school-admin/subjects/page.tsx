"use client";

import { Button, Card, Input, Select, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";

/* OLD API (temporary) */
import { getClassesApi } from "@/src/modules/school-admin/classes/api/class.api";

/* RTK */
import {
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
} from "@/src/modules/school-admin/subjects/subject.api";

/* GLOBAL TYPES */
import {
  IClassSubjects,
  ISubject,
} from "@/shared-types/subject.types";

interface ClassItem {
  _id: string;
  name: string;
}

export default function SubjectsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [subjectInput, setSubjectInput] = useState("");

  /* =========================
     RTK QUERY
  ========================= */

  const { data: subjectsData = [], isLoading } = useGetSubjectsQuery();

  /* =========================
     MUTATIONS
  ========================= */

  const [createSubjects, { isLoading: creating }] = useCreateSubjectsMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  /* =========================
     LOAD CLASSES
  ========================= */

  useEffect(() => {
    const loadClasses = async () => {
      const res = await getClassesApi();
      setClasses(res);
    };

    loadClasses();
  }, []);

  /* =========================
     ADD
  ========================= */

  const handleAddSubjects = async () => {
    if (!classId || !subjectInput) {
      return message.warning("Select class and enter subjects");
    }

    try {
      const subjects = subjectInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createSubjects({
        classId,
        subjects,
      }).unwrap();

      message.success("Subjects added");
      setSubjectInput("");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to add subjects");
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id).unwrap();
      message.success("Subject deleted");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete");
    }
  };

  /* =========================
     TABLE
  ========================= */

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
              closable
              onClose={(e) => {
                e.preventDefault();
                handleDelete(subject._id);
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
      {/* CONTROLS */}

      <div style={{ display: "flex", gap: 12, marginBottom: 25 }}>
        <Select
          placeholder="Select Class"
          style={{ width: 200 }}
          onChange={(value) => setClassId(value)}
          options={classes.map((cls) => ({
            value: cls._id,
            label: cls.name,
          }))}
        />

        <Input
          placeholder="Math, English, Science"
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
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

      {/* TABLE */}

      <Table<IClassSubjects>
        rowKey="classId"
        columns={columns}
        dataSource={subjectsData}
        loading={isLoading}
        pagination={false}
        bordered
      />
    </Card>
  );
}


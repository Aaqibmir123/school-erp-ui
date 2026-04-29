"use client";

import { App, Button, Input, List, Popconfirm } from "antd";
import { useState } from "react";

import {
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
  useGetSubjectsByClassQuery,
} from "../subject.api";

import { ISubject } from "@/shared-types/subject.types";

interface Props {
  classId: string;
}

export default function SubjectsList({ classId }: Props) {
  const { message } = App.useApp();
  const [name, setName] = useState("");

  /* ✅ RTK Queries */
  const { data, isLoading } = useGetSubjectsByClassQuery(classId, {
    skip: !classId,
  });

  const subjects: ISubject[] = data || [];
  /* ✅ Mutations */
  const [createSubjects, { isLoading: creating }] = useCreateSubjectsMutation();

  const [deleteSubject] = useDeleteSubjectMutation();

  /* =========================
     ADD
  ========================= */

  const handleAdd = async () => {
    if (!name) return;

    try {
      await createSubjects({
        classId,
        subjects: [name],
      }).unwrap();

      message.success("Subject added");
      setName("");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to add subject");
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
      message.error(error?.data?.message || "Failed to delete subject");
    }
  };

  return (
    <div>
      {/* INPUT */}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Input
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button type="primary" onClick={handleAdd} loading={creating}>
          Add
        </Button>
      </div>

      {/* LIST */}

      <List
        bordered
        loading={isLoading}
        dataSource={subjects}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Popconfirm
                title="Delete subject?"
                onConfirm={() => handleDelete(item._id)}
                key="delete"
              >
                <Button danger size="small">
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            {item.name}
          </List.Item>
        )}
      />
    </div>
  );
}


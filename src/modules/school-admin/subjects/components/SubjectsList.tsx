"use client";

import { App, Button, Input, List, Popconfirm } from "antd";
import { memo, useCallback, useState } from "react";

import {
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
  useGetSubjectsByClassQuery,
} from "../subject.api";

import { ISubject } from "@/shared-types/subject.types";

interface Props {
  classId: string;
}

function SubjectsList({ classId }: Props) {
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

  const handleAdd = useCallback(async () => {
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
  }, [classId, createSubjects, message, name]);

  /* =========================
     DELETE
  ========================= */

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteSubject(id).unwrap();
      message.success("Subject deleted");
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete subject");
    }
  }, [deleteSubject, message]);

  return (
    <div>
      {/* INPUT */}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Input
          placeholder="Subject name"
          value={name}
          style={{ minWidth: 220, flex: "1 1 220px" }}
          onChange={(e) => setName(e.target.value)}
        />

        <Button type="primary" onClick={handleAdd} loading={creating} style={{ flex: "0 0 auto" }}>
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

export default memo(SubjectsList);


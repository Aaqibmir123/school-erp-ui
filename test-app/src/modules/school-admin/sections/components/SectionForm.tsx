"use client";

import { Button, Input, Space, message } from "antd";
import { useState } from "react";

import { useCreateSectionsMutation } from "../sectionApi";

interface Props {
  classId: string;
}

export default function SectionForm({ classId }: Props) {
  const [sections, setSections] = useState("");

  const [createSections, { isLoading }] = useCreateSectionsMutation();

  const handleCreate = async () => {
    if (!sections.trim()) {
      message.error("Enter sections");
      return;
    }

    const list = sections
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    try {
      await createSections({
        classId,
        sections: list,
      }).unwrap();

      message.success("Sections created");

      setSections("");
    } catch (err: any) {
      message.error(err?.data?.message || "Create failed");
    }
  };

  return (
    <Space>
      <Input
        placeholder="A,B,C"
        value={sections}
        onChange={(e) => setSections(e.target.value)}
        style={{ width: 300 }}
      />

      <Button type="primary" loading={isLoading} onClick={handleCreate}>
        Create
      </Button>
    </Space>
  );
}

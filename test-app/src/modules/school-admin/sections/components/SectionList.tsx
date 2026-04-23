"use client";

import { Button, Space, Table, Tag, message } from "antd";
import { useMemo } from "react";

import { useDeleteSectionMutation, useGetSectionsQuery } from "../sectionApi";

import { showToast } from "@/src/utils/toast";
import type { ColumnsType } from "antd/es/table";
import type { Section } from "../../../../../../shared-types/section.types";
interface SectionGroup {
  className: string;
  sections: Section[];
}

export default function SectionList() {
  const { data, isLoading } = useGetSectionsQuery({});

  const [deleteSection, { isLoading: deleting }] = useDeleteSectionMutation();

  // 🔥 group data (typed)
  const groupedData: SectionGroup[] = useMemo(() => {
    if (!data) return [];

    const grouped: Record<string, Section[]> = {};

    data.forEach((s) => {
      const className = s.classId?.name || "Unknown";

      if (!grouped[className]) {
        grouped[className] = [];
      }

      grouped[className].push(s);
    });

    return Object.keys(grouped).map((cls) => ({
      className: cls,
      sections: grouped[cls],
    }));
  }, [data]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSection(id).unwrap();
      showToast.apiResponse(res, "Section Deleted");
    } catch (err: any) {
      message.error(err?.data?.message || "Delete failed");
    }
  };

  // 🔥 typed columns
  const columns: ColumnsType<SectionGroup> = [
    {
      title: "Class",
      dataIndex: "className",
    },
    {
      title: "Sections",
      render: (_, record) => (
        <Space wrap>
          {record.sections.map((s) => (
            <Tag key={s._id}>{s.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space wrap>
          {record.sections.map((s) => (
            <Button
              key={s._id}
              danger
              size="small"
              loading={deleting}
              onClick={() => handleDelete(s._id)}
            >
              Delete {s.name}
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="className"
      columns={columns}
      dataSource={groupedData}
      loading={isLoading}
      pagination={false}
    />
  );
}

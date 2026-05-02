"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { App, Button, Tag } from "antd";
import { memo, useCallback, useMemo } from "react";

import { useDeleteSectionMutation, useGetSectionsQuery } from "../sectionApi";

import { showToast } from "@/src/utils/toast";
import type { ColumnsType } from "antd/es/table";
import type { Section } from "@/shared-types/section.types";

interface SectionGroup {
  className: string;
  sections: Section[];
}

function SectionList({ classId }: { classId?: string }) {
  const { message } = App.useApp();
  const { data, isLoading } = useGetSectionsQuery(
    classId ? { classId } : {},
  );

  const [deleteSection, { isLoading: deleting }] = useDeleteSectionMutation();

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

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await deleteSection(id).unwrap();
      showToast.apiResponse(res, "Section Deleted");
    } catch (err: any) {
      message.error(err?.data?.message || "Delete failed");
    }
  }, [deleteSection, message]);

  const columns: ColumnsType<SectionGroup> = useMemo(
    () => [
      {
        title: "Class",
        dataIndex: "className",
      },
      {
        title: "Sections",
        render: (_, record) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {record.sections.map((s) => (
              <Tag key={s._id}>{s.name}</Tag>
            ))}
          </div>
        ),
      },
      {
        title: "Action",
        render: (_, record) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
          </div>
        ),
      },
    ],
    [deleting, handleDelete],
  );

  return (
    <ResponsiveTable
      rowKey="className"
      columns={columns}
      dataSource={groupedData}
      loading={isLoading}
      pagination={false}
    />
  );
}

export default memo(SectionList);

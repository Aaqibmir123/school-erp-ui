"use client";

import { Button, DatePicker, Popconfirm, Table, Tag, TimePicker } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import {
  useDeleteScheduleMutation,
  useGetSchedulesQuery,
  useUpdateScheduleMutation,
} from "./exam.api";

import { showToast } from "@/src/utils/toast";

export default function ScheduleList({ examId }: any) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: res } = useGetSchedulesQuery(examId);

  /* ================= GROUP DATA ================= */
  const schedules = useMemo(() => {
    if (!res) return [];

    const map = new Map();

    res.forEach((item: any) => {
      const key = `${item.classId?._id}-${item.subjectId?._id}-${item.date}-${item.startTime}`;

      if (!map.has(key)) {
        map.set(key, {
          key, // 🔥 important
          rawItems: [],
          className: item.classId?.name,
          subjectName: item.subjectId?.name,
          sections: [],
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
        });
      }

      const group = map.get(key);

      group.rawItems.push(item); // 🔥 store all real rows

      if (item.sectionId) {
        group.sections.push(item.sectionId.name);
      }
    });

    return Array.from(map.values());
  }, [res]);

  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  /* ================= EDIT ================= */

  const handleEdit = (record: any) => {
    setEditingKey(record.key);

    setFormData({
      date: dayjs(record.date),
      startTime: dayjs(record.startTime, "HH:mm"),
      endTime: dayjs(record.endTime, "HH:mm"),
    });
  };

  /* ================= SAVE ================= */

  const handleSave = async (record: any) => {
    try {
      const promises = record.rawItems.map((item: any) =>
        updateSchedule({
          id: item._id, // 🔥 each real row update
          data: {
            date: formData.date.format("YYYY-MM-DD"),
            startTime: formData.startTime.format("HH:mm"),
            endTime: formData.endTime.format("HH:mm"),
          },
        }).unwrap(),
      );

      await Promise.all(promises);

      showToast.success("✅ Updated all sections");
      setEditingKey(null);
    } catch (err: any) {
      showToast.error("❌ Update failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (record: any) => {
    try {
      const promises = record.rawItems.map((item: any) =>
        deleteSchedule(item._id).unwrap(),
      );

      await Promise.all(promises);

      showToast.success("Deleted");
    } catch {
      showToast.error("Delete failed");
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      title: "#",
      render: (_: any, __: any, i: number) => i + 1,
    },

    {
      title: "Class",
      dataIndex: "className",
    },

    {
      title: "Subject",
      dataIndex: "subjectName",
    },

    {
      title: "Sections",
      render: (_: any, r: any) =>
        r.sections.map((s: string) => <Tag key={s}>{s}</Tag>),
    },

    {
      title: "Date",
      render: (_: any, r: any) =>
        editingKey === r.key ? (
          <DatePicker
            value={formData.date}
            onChange={(v) => setFormData({ ...formData, date: v })}
          />
        ) : (
          <Tag>{dayjs(r.date).format("DD MMM YYYY")}</Tag>
        ),
    },

    {
      title: "Time",
      render: (_: any, r: any) =>
        editingKey === r.key ? (
          <div style={{ display: "flex", gap: 6 }}>
            <TimePicker
              use12Hours
              format="h:mm A"
              value={formData.startTime}
              onChange={(v) => setFormData({ ...formData, startTime: v })}
            />
            <TimePicker
              use12Hours
              format="h:mm A"
              value={formData.endTime}
              onChange={(v) => setFormData({ ...formData, endTime: v })}
            />
          </div>
        ) : (
          <Tag color="green">
            {dayjs(r.startTime, "HH:mm").format("h:mm A")} -{" "}
            {dayjs(r.endTime, "HH:mm").format("h:mm A")}
          </Tag>
        ),
    },

    {
      title: "Action",
      render: (_: any, r: any) =>
        editingKey === r.key ? (
          <Button type="primary" onClick={() => handleSave(r)}>
            Save
          </Button>
        ) : (
          <>
            <Button size="small" onClick={() => handleEdit(r)}>
              Edit
            </Button>

            <Popconfirm title="Delete?" onConfirm={() => handleDelete(r)}>
              <Button size="small" danger>
                Delete
              </Button>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <Table
      rowKey="key"
      columns={columns}
      dataSource={schedules}
      pagination={false}
      locale={{
        emptyText: (
          <div style={{ padding: "22px 0", color: "#94a3b8" }}>
            No schedule added yet
          </div>
        ),
      }}
      style={{
        marginTop: 8,
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  );
}

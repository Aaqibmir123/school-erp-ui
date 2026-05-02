"use client";

import { Button, Card, DatePicker, Grid, Popconfirm, Select, Space, Table, Tag, TimePicker, Typography } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import {
  useDeleteScheduleMutation,
  useGetSchedulesQuery,
  useUpdateScheduleMutation,
} from "./exam.api";

import { showToast } from "@/src/utils/toast";
import { useGetTeachersQuery } from "../api/teacherApi";

const { Text } = Typography;

export default function ScheduleList({ examId }: any) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const { data: res } = useGetSchedulesQuery(examId);
  const { data: teachers = [] } = useGetTeachersQuery();

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
          teacherName: item.teacherId
            ? `${item.teacherId.firstName || ""} ${item.teacherId.lastName || ""}`.trim()
            : null,
          inchargeName: item.inchargeTeacherId
            ? `${item.inchargeTeacherId.firstName || ""} ${item.inchargeTeacherId.lastName || ""}`.trim()
            : null,
          sections: [],
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          inchargeTeacherId: item.inchargeTeacherId?._id || item.inchargeTeacherId || null,
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
      inchargeTeacherId: record.inchargeTeacherId || undefined,
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
            inchargeTeacherId: formData.inchargeTeacherId || undefined,
          },
        }).unwrap(),
      );

      await Promise.all(promises);

      showToast.success("✅ Updated all sections");
      setEditingKey(null);
    } catch (err: any) {
      showToast.apiError(err, "❌ Update failed");
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
      title: "Teacher",
      render: (_: any, r: any) =>
        r.teacherName ? <Tag color="green">{r.teacherName}</Tag> : <Tag color="gold">Optional</Tag>,
    },

    {
      title: "Incharge",
      render: (_: any, r: any) =>
        r.inchargeName ? <Tag color="geekblue">{r.inchargeName}</Tag> : <Tag>Optional</Tag>,
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
          <Space direction="vertical" size={8}>
            <Space wrap size={6}>
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
            </Space>
            <Select
              allowClear
              showSearch
              placeholder="Exam incharge"
              optionFilterProp="label"
              style={{ minWidth: 220 }}
              value={formData.inchargeTeacherId}
              onChange={(value) => setFormData({ ...formData, inchargeTeacherId: value })}
              options={teachers.map((teacher: any) => ({
                label: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
                value: teacher._id,
              }))}
            />
          </Space>
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
    <>
      {isMobile ? (
        <Space direction="vertical" size={12} style={{ width: "100%", marginTop: 8 }}>
          {schedules.length ? (
            schedules.map((item: any, index: number) => (
              <Card
                key={item.key}
                size="small"
                style={{ borderRadius: 16 }}
                styles={{ body: { padding: 14 } }}
              >
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                    <div>
                      <Text strong>{index + 1}. {item.className}</Text>
                      <div style={{ color: "#64748b", marginTop: 2 }}>{item.subjectName}</div>
                    </div>
                    <Tag color="blue">{dayjs(item.date).format("DD MMM YYYY")}</Tag>
                  </Space>

                  <Space wrap size={6}>
                    {item.sections.map((s: string) => <Tag key={s}>{s}</Tag>)}
                    {item.teacherName ? <Tag color="green">{item.teacherName}</Tag> : <Tag color="gold">Optional</Tag>}
                    {item.inchargeName ? <Tag color="geekblue">{item.inchargeName}</Tag> : <Tag>Optional</Tag>}
                  </Space>

                  <Tag color="green" style={{ width: "fit-content" }}>
                    {dayjs(item.startTime, "HH:mm").format("h:mm A")} - {dayjs(item.endTime, "HH:mm").format("h:mm A")}
                  </Tag>

                  {editingKey === item.key ? (
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <DatePicker
                        value={formData.date}
                        onChange={(v) => setFormData({ ...formData, date: v })}
                        style={{ width: "100%" }}
                      />
                      <Space wrap size={6} style={{ width: "100%" }}>
                        <TimePicker
                          use12Hours
                          format="h:mm A"
                          value={formData.startTime}
                          onChange={(v) => setFormData({ ...formData, startTime: v })}
                          style={{ width: "calc(50% - 3px)" }}
                        />
                        <TimePicker
                          use12Hours
                          format="h:mm A"
                          value={formData.endTime}
                          onChange={(v) => setFormData({ ...formData, endTime: v })}
                          style={{ width: "calc(50% - 3px)" }}
                        />
                      </Space>
                      <Select
                        allowClear
                        showSearch
                        placeholder="Exam incharge"
                        optionFilterProp="label"
                        value={formData.inchargeTeacherId}
                        onChange={(value) => setFormData({ ...formData, inchargeTeacherId: value })}
                        options={teachers.map((teacher: any) => ({
                          label: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
                          value: teacher._id,
                        }))}
                      />
                      <Space>
                        <Button type="primary" onClick={() => handleSave(item)}>
                          Save
                        </Button>
                        <Button onClick={() => setEditingKey(null)}>Cancel</Button>
                      </Space>
                    </Space>
                  ) : (
                    <Space>
                      <Button onClick={() => handleEdit(item)}>Edit</Button>
                      <Popconfirm title="Delete?" onConfirm={() => handleDelete(item)}>
                        <Button danger>Delete</Button>
                      </Popconfirm>
                    </Space>
                  )}
                </Space>
              </Card>
            ))
          ) : (
            <div style={{ padding: "22px 0", color: "#94a3b8", textAlign: "center" }}>
              No schedule added yet
            </div>
          )}
        </Space>
      ) : (
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
      )}
    </>
  );
}

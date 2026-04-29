"use client";

import { App, Button, Card, Table } from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useSaveTimetableMutation,
  useUpdateTimetableMutation,
} from "../api/createTimetable";

import CellSelector from "./CellSelector";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DragTimetable({
  subjects,
  teachers,
  periods,
  classId,
  sectionId,
  schoolTiming,
  initialData = [],
  refetchTimetable,
}: any) {
  const [grid, setGrid] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const [saveTimetable] = useSaveTimetableMutation();
  const [updateTimetable] = useUpdateTimetableMutation();

  /* ====================================== */
  /* 🔥 PREFILL (OPTIMIZED) */
  /* ====================================== */

  useEffect(() => {
    if (!initialData?.length) {
      setGrid({});
      return;
    }

    const newGrid: any = {};

    for (const item of initialData) {
      const pid =
  item?.periodId && typeof item.periodId === "object"
    ? item.periodId?._id?.toString()
    : item?.periodId?.toString();

if (!pid) continue;

      newGrid[`${item.day}-${pid}`] = {
        subjectId: item.subjectId,
        teacherId: item.teacherId,
        isEdit: true,
      };
    }

    setGrid(newGrid);
  }, [initialData]);

  /* ====================================== */
  /* 🔥 SORT PERIODS (MEMO) */
  /* ====================================== */

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [periods],
  );

  const formatTime = (t: string) => dayjs(t, "HH:mm").format("h:mm A");
  const toMinutes = (value?: string) => {
    if (!value) return null;
    const parsed = dayjs(value, "HH:mm");
    if (!parsed.isValid()) return null;
    return parsed.hour() * 60 + parsed.minute();
  };

  /* ====================================== */
  /* 🔥 CHANGE (MEMOIZED) */
  /* ====================================== */

  const handleCellChange = useCallback(
    (day: string, periodId: string, field: string, value: string) => {
      const key = `${day}-${periodId}`;

      setGrid((prev: any) => {
        const nextCell = {
          ...prev[key],
          [field]: value,
          isEdit: prev[key]?.isEdit || false,
        };

        if (!nextCell.subjectId && !nextCell.teacherId) {
          const nextGrid = { ...prev };
          delete nextGrid[key];
          return nextGrid;
        }

        return {
          ...prev,
          [key]: nextCell,
        };
      });
    },
    [],
  );

  /* ====================================== */
  /* 🔥 BUILD PAYLOAD (OPTIMIZED) */
  /* ====================================== */

  const buildPayload = () => {
    const create: any[] = [];
    const update: any[] = [];

    for (const key in grid) {
      const [day, periodId] = key.split("-");
      const cell = grid[key];

      const period = periods.find((p: any) => p._id === periodId);

      if (!period || period.type !== "class") continue;
      if (!cell?.subjectId || !cell?.teacherId) continue;

      const payload = {
        day,
        periodId,
        classId,
        sectionId,
        subjectId: cell.subjectId,
        teacherId: cell.teacherId,
      };

      cell.isEdit ? update.push(payload) : create.push(payload);
    }

    return { create, update };
  };

  /* ====================================== */
  /* 🔥 SAVE (OPTIMIZED 💣) */
  /* ====================================== */

  const handleSave = async () => {
    try {
      const { create, update } = buildPayload();

      if (!create.length && !update.length) {
        message.warning("Nothing to save");
        return;
      }

      setLoading(true);

      /* ✅ STEP 1: CREATE (once) */
      if (create.length) {
        await saveTimetable(create).unwrap();
      }

      /* ❌ DON'T DO PARALLEL UPDATE */
      /* ✅ STEP 2: UPDATE (sequential - STOP ON FIRST ERROR) */

      for (const item of update) {
        await updateTimetable(item).unwrap(); // 💣 yahan error aaye → loop break
      }

      message.success("Timetable saved successfully");

      refetchTimetable?.();
    } catch (err: any) {
      /* 💣 ONLY ONE MESSAGE */
      message.destroy(); // clear previous (important)

      message.error({
        content: err?.data?.message || "Something went wrong",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ====================================== */
  /* 🔥 COLUMNS (MEMOIZED) */
  /* ====================================== */

  const columns = useMemo<any[]>(
    () => [
      {
        title: "Time",
        width: 140,
        render: (_: any, record: any) => (
          <div>
            <div style={{ fontWeight: 600 }}>
              {formatTime(record.startTime)}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {formatTime(record.endTime)}
            </div>
          </div>
        ),
      },

      ...days.map((day) => ({
        title: day,
        align: "center" as const,
        render: (_: any, record: any) => {
          const key = `${day}-${record._id}`;
          const value = grid[key] || {};

          if (record.type !== "class") {
            return (
              <div
                style={{
                  padding: 10,
                  textAlign: "center",
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: 8,
                  fontWeight: 600,
                  color: "#d48806",
                }}
              >
                {record.type === "break" ? "Break" : "Lunch"}
              </div>
            );
          }

          return (
            <div
              style={{
                padding: 6,
                borderRadius: 8,
                background: value?.isEdit ? "#f6ffed" : "#fff",
                border: value?.isEdit ? "1px solid #52c41a" : "1px dashed #ddd",
              }}
            >
              <CellSelector
                value={value}
                subjects={subjects}
                teachers={teachers}
                showClearAction={!value?.isEdit && !!(value?.subjectId || value?.teacherId)}
                onClear={() => {
                  handleCellChange(day, record._id, "subjectId", undefined as any);
                  handleCellChange(day, record._id, "teacherId", undefined as any);
                }}
                onChange={(field: string, val: string) =>
                  handleCellChange(day, record._id, field, val)
                }
              />

              {value?.isEdit && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#52c41a",
                    textAlign: "right",
                    marginTop: 4,
                    fontWeight: 600,
                    opacity: 0.8,
                  }}
                >
                  Edited
                </div>
              )}
            </div>
          );
        },
      })),
    ],
    [grid, subjects, teachers, periods],
  );

  /* ====================================== */
  /* UI */
  /* ====================================== */

  return (
    <Card title="Assign Timetable">
      <Table
        rowKey="_id"
        dataSource={sortedPeriods}
        columns={columns}
        pagination={false}
        bordered
        scroll={{ x: true }}
      />

      <Button
        type="primary"
        loading={loading}
        onClick={handleSave}
        style={{
          marginTop: 20,
          height: 42,
          borderRadius: 8,
          fontWeight: 600,
        }}
        block
      >
        Save Timetable
      </Button>
    </Card>
  );
}

"use client";

import { Table, Select } from "antd";
import { useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [1, 2, 3, 4, 5, 6];

const subjects = [
  { label: "Math", value: "Math" },
  { label: "English", value: "English" },
  { label: "Urdu", value: "Urdu" },
  { label: "Science", value: "Science" },
];

export default function TimetableGrid() {
  const [data, setData] = useState<any[]>([]);

  /* initialize rows */

  useState(() => {
    const rows = periods.map((period) => {
      const row: any = { key: period, period };

      days.forEach((day) => {
        row[day] = null;
      });

      return row;
    });

    setData(rows);
  });

  /* update cell */

  const handleChange = (value: string, rowIndex: number, day: string) => {
    const newData = [...data];

    newData[rowIndex][day] = value;

    setData(newData);
  };

  const columns: any[] = [
    {
      title: "Period",
      dataIndex: "period",
      width: 80,
    },

    ...days.map((day) => ({
      title: day,
      dataIndex: day,
      render: (_: any, record: any, rowIndex: number) => (
        <Select
          placeholder="Subject"
          style={{ width: "100%" }}
          value={record[day]}
          options={subjects}
          onChange={(value) => handleChange(value, rowIndex, day)}
        />
      ),
    })),
  ];

  return (
    <Table columns={columns} dataSource={data} pagination={false} bordered />
  );
}

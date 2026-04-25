"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import React, { useState } from "react";

import { useDeleteStudentMutation } from "../studentApi";

import type { StudentPopulated } from "@/shared-types/student.types";

import StudentDrawer from "./StudentDrawer";

interface Props {
  record: StudentPopulated;
}

const StudentRowActions: React.FC<Props> = ({ record }) => {
  const [open, setOpen] = useState(false);

  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();

  return (
    <>
      <Space size="small">
        {/* EDIT */}
        <Tooltip title="Edit">
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => setOpen(true)}
          />
        </Tooltip>

        {/* DELETE */}
        <Popconfirm
          title="Delete Student?"
          description={`Are you sure you want to delete ${record.firstName}?`}
          okText="Delete"
          okButtonProps={{ danger: true, loading: isLoading }}
          onConfirm={async () => {
            try {
              await deleteStudent(record._id).unwrap();
              window.dispatchEvent(new Event("students-updated"));
            } catch (err) {
              console.error(err);
            }
          }}
        >
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} size="small" danger type="text" />
          </Tooltip>
        </Popconfirm>
      </Space>

      {/* 🔥 REUSE DRAWER */}
      <StudentDrawer
        open={open}
        onClose={() => setOpen(false)}
        initialData={record} // 💣 edit mode
      />
    </>
  );
};

export default React.memo(StudentRowActions);


"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Tooltip } from "antd";
import React, { useState } from "react";

import { useDeleteStudentMutation } from "../studentApi";

import type { StudentPopulated } from "../../../../../../shared-types/student.types";

import StudentDrawer from "./StudentDrawer";

interface Props {
  record: StudentPopulated;
}

const StudentRowActions: React.FC<Props> = ({ record }) => {
  const [open, setOpen] = useState(false);

  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();

  /* ================= DELETE ================= */
  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Student?",
      content: `Are you sure you want to delete ${record.firstName}?`,
      okText: "Delete",
      okType: "danger",

      onOk: async () => {
        try {
          await deleteStudent(record._id).unwrap();
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

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
        <Tooltip title="Delete">
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            type="text"
            loading={isLoading}
            onClick={handleDelete}
          />
        </Tooltip>
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

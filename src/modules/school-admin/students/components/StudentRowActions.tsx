"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import React, { useState } from "react";

import type { StudentPopulated } from "@/shared-types/student.types";
import { showToast } from "@/src/utils/toast";
import { useDeleteStudentMutation } from "../studentApi";
import StudentDrawer from "./StudentDrawer";

interface Props {
  record: StudentPopulated;
}

const StudentRowActions: React.FC<Props> = ({ record }) => {
  const [open, setOpen] = useState(false);
  const [deleteStudent, { isLoading }] = useDeleteStudentMutation();

  const studentName = `${record.firstName} ${record.lastName || ""}`.trim();

  return (
    <>
      <Space size="small">
        <Tooltip title="Edit student">
          <Button
            icon={<EditOutlined />}
            size="small"
            type="text"
            onClick={() => setOpen(true)}
          />
        </Tooltip>

        <Popconfirm
          title="Delete student record?"
          description={`This will remove ${studentName} from the school list.`}
          okText="Delete Student"
          cancelText="Cancel"
          okButtonProps={{ danger: true, loading: isLoading }}
          onConfirm={async () => {
            try {
              await deleteStudent(record._id).unwrap();
              window.dispatchEvent(new Event("students-updated"));
              window.dispatchEvent(new Event("dashboard-updated"));
              showToast.success("Student deleted successfully");
            } catch (err) {
              showToast.apiError(err, "Failed to delete student");
            }
          }}
        >
          <Tooltip title="Delete student">
            <Button icon={<DeleteOutlined />} size="small" danger type="text" />
          </Tooltip>
        </Popconfirm>
      </Space>

      <StudentDrawer
        open={open}
        onClose={() => setOpen(false)}
        initialData={record}
      />
    </>
  );
};

export default React.memo(StudentRowActions);

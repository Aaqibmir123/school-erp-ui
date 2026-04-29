"use client";

import { Button, Card } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";

import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../src/modules/school-admin/api/teacherApi";
import AddTeacherModal from "../../../src/modules/school-admin/components/add-teacher-modal";
import TeachersTable from "../../../src/modules/school-admin/components/teachers-table";

import { showToast } from "@/src/utils/toast";

function TeachersPage() {
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const { data: teachers = [], isLoading } = useGetTeachersQuery();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const handleAdd = () => {
    setSelectedTeacher(null);
    setOpen(true);
  };

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleDelete = async (teacherId: string) => {
    try {
      await deleteTeacher(teacherId).unwrap();
      showToast.success("Teacher deleted successfully");
    } catch (err: any) {
      showToast.error(
        err?.data?.message ||
          "Cannot delete teacher. Assigned to classes/subjects.",
      );
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <Card
      title="Teachers"
      extra={
        <Button type="primary" onClick={handleAdd}>
          Add Teacher
        </Button>
      }
    >
      <TeachersTable
        teachers={teachers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddTeacherModal
        open={open}
        onClose={handleCloseModal}
        teacher={selectedTeacher}
      />
    </Card>
  );
}

export default dynamic(() => Promise.resolve(TeachersPage), {
  ssr: false,
});

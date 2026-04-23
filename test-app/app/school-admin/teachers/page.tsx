"use client";

import { Button, Card, Space } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import SetTeacherPasswordModal from "../../../src/modules/school-admin/assign-subject/SetTeacherPasswordModal";
import AddTeacherModal from "../../../src/modules/school-admin/components/add-teacher-modal";
import TeachersTable from "../../../src/modules/school-admin/components/teachers-table";

import {
  useDeleteTeacherMutation,
  useGetTeachersQuery,
} from "../../../src/modules/school-admin/api/teacherApi";

import { showToast } from "@/src/utils/toast";

function TeachersPage() {
  /* =========================
     HYDRATION FIX
  ========================= */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* =========================
     STATE
  ========================= */
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  /* =========================
     API
  ========================= */
  const { data: teachers = [], isLoading } = useGetTeachersQuery();
  const [deleteTeacher] = useDeleteTeacherMutation();

  /* =========================
     HANDLERS
  ========================= */

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

  /* =========================
     PREVENT HYDRATION MISMATCH
  ========================= */
  if (!mounted) return null;

  /* =========================
     RENDER
  ========================= */

  return (
    <Card
      title="Teachers"
      extra={
        <Space>
          <Button onClick={() => setPasswordOpen(true)}>
            Set Teacher Password
          </Button>

          <Button type="primary" onClick={handleAdd}>
            Add Teacher
          </Button>
        </Space>
      }
    >
      <TeachersTable
        teachers={teachers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 🔥 ADD / EDIT MODAL */}
      <AddTeacherModal
        open={open}
        onClose={handleCloseModal}
        teacher={selectedTeacher}
      />

      {/* 🔐 PASSWORD */}
      <SetTeacherPasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </Card>
  );
}

/* =========================
   SSR DISABLE (IMPORTANT)
========================= */
export default dynamic(() => Promise.resolve(TeachersPage), {
  ssr: false,
});

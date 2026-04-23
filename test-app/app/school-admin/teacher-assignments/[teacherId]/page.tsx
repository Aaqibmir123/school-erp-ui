"use client";

import { Card } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";

import TeacherAssignmentsTable from "@/src/modules/school-admin/teacher-assignments/components/TeacherAssignmentsTable";
import { TeacherAssignment } from "../../../../../shared-types/teacherAssignment.types";
import { useGetTeacherAssignmentsQuery } from "../../../../src/modules/school-admin/teacher-assignments/teacherAssignment.api";

export default function TeacherAssignmentsPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  /* ✅ pagination state (only this needed) */
  const [page, setPage] = useState(1);

  /* ✅ RTK Query */
  const { data, isLoading, isFetching } = useGetTeacherAssignmentsQuery(
    {
      teacherId,
      page,
      limit: 10,
    },
    {
      skip: !teacherId, // important
    },
  );

  const assignments: TeacherAssignment[] = data?.data || [];
  const total = data?.total || 0;

  return (
    <Card title="Teacher Subject Assignments">
      <TeacherAssignmentsTable
        data={assignments}
        loading={isLoading || isFetching}
        page={page}
        total={total}
        onPageChange={setPage}
      />
    </Card>
  );
}

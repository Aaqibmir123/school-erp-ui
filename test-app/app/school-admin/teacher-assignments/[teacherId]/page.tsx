"use client";

import { Button, Card, Empty, Grid, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { TeacherAssignment } from "@/shared-types/teacherAssignment.types";
import { useGetTeachersQuery } from "@/src/modules/school-admin/api/teacherApi";
import TeacherAssignmentsTable from "@/src/modules/school-admin/teacher-assignments/components/TeacherAssignmentsTable";
import { useGetTeacherAssignmentsQuery } from "../../../../src/modules/school-admin/teacher-assignments/teacherAssignment.api";

const { Text, Title } = Typography;

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;
  const [page, setPage] = useState(1);
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;

  const { data: teachers = [] } = useGetTeachersQuery();
  const teacher = teachers.find((item) => item._id === teacherId);

  const { data, isLoading, isFetching } = useGetTeacherAssignmentsQuery(
    {
      teacherId,
      page,
      limit: 10,
    },
    {
      skip: !teacherId,
      refetchOnMountOrArgChange: true,
    },
  );

  const assignments: TeacherAssignment[] = data?.data || [];
  const total = data?.total || 0;

  return (
    <Card
      title="Teacher Subject Assignments"
      extra={
        !isCompact ? (
          <Button onClick={() => router.push("/school-admin/teachers")}>
            Back To Teachers
          </Button>
        ) : null
      }
    >
      {isCompact ? (
        <div style={{ marginBottom: 16 }}>
          <Button block onClick={() => router.push("/school-admin/teachers")}>
            Back To Teachers
          </Button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          {teacher
            ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
            : "Selected Teacher"}
        </Title>
      </div>

      {!isLoading && !isFetching && assignments.length === 0 ? (
        <Empty description="No subject assignments are saved for this teacher yet" />
      ) : (
        <TeacherAssignmentsTable
          data={assignments}
          loading={isLoading || isFetching}
          page={page}
          total={total}
          onPageChange={setPage}
        />
      )}
    </Card>
  );
}

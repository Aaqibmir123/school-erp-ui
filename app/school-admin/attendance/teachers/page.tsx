"use client";

import dynamic from "next/dynamic";

import TeacherAttendancePage from "@/src/modules/school-admin/attendance/TeacherAttendancePage";

function TeacherAttendanceRoute() {
  return <TeacherAttendancePage />;
}

export default dynamic(() => Promise.resolve(TeacherAttendanceRoute), {
  ssr: false,
});

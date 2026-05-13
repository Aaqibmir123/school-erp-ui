"use client";

import dynamic from "next/dynamic";

import StudentAttendancePage from "@/src/modules/school-admin/attendance/StudentAttendancePage";

function StudentsAttendanceRoute() {
  return <StudentAttendancePage />;
}

export default dynamic(() => Promise.resolve(StudentsAttendanceRoute), {
  ssr: false,
});

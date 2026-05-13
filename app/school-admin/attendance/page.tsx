"use client";

import dynamic from "next/dynamic";

import AttendanceLandingPage from "@/src/modules/school-admin/attendance/AttendanceLandingPage";

function AttendanceRoute() {
  return <AttendanceLandingPage />;
}

export default dynamic(() => Promise.resolve(AttendanceRoute), {
  ssr: false,
});

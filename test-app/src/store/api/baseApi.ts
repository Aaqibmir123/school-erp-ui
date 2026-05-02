import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithInterceptor } from "./baseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithInterceptor,

  tagTypes: [
    "Auth",
    "Dashboard",
    "Timetable",
    "TeacherAssignments",
    "Subjects",
    "Students",
    "Classes",
    "Exams",
    "Results",
    "Sections",
    "Periods",
    "Teachers",
    "AcademicYears",
    "Notices",
    "Schedule",
    "AdmitCards",
    "Fee",
    "Transport",
    "Attendance",
  ],

  endpoints: () => ({}),
});

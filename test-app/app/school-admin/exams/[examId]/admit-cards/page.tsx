"use client";

import { useParams } from "next/navigation";

import AdmitCardPage from "@/src/modules/school-admin/exam/AdmitCardPage";

export default function Page() {
  const params = useParams();
  const examId = Array.isArray(params.examId)
    ? params.examId[0]
    : params.examId || "";

  return <AdmitCardPage examId={examId} />;
}

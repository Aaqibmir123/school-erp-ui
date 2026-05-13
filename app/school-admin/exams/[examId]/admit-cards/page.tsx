"use client";

import { useParams } from "next/navigation";

import AdmitCardPage from "@/src/modules/school-admin/exam/AdmitCardPage";

export default function Page() {
  const params = useParams();
  const examParam = params?.examId;
  const examId = Array.isArray(examParam)
    ? examParam[0]
    : examParam || "";

  return <AdmitCardPage examId={examId} />;
}

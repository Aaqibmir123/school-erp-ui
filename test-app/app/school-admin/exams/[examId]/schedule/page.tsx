"use client";

import SchedulePage from "@/src/modules/school-admin/exam/SchedulePage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const examId = Array.isArray(params.examId)
    ? params.examId[0]
    : params.examId || "";

  return <SchedulePage examId={examId} />;
}

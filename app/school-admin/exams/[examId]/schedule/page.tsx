"use client";

import SchedulePage from "@/src/modules/school-admin/exam/SchedulePage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const examParam = params?.examId;
  const examId = Array.isArray(examParam)
    ? examParam[0]
    : examParam || "";

  return <SchedulePage examId={examId} />;
}

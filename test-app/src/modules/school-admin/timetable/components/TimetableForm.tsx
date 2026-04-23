// "use client";

// import { Card, Select, Spin } from "antd";
// import { useEffect, useState } from "react";

// import AssignTimetable from "./DragTimetable";
// /* TYPES */
// import type {
//   ClassItem,
//   Subject,
// } from "../../../../../../shared-types/timetable.types";

// /* TEMP */
// import { getClassesApi } from "../../classes/api/class.api";

// /* RTK */
// import { useGetSubjectsByClassQuery } from "../../subjects/subject.api";

// export default function TimetablePage() {
//   const [classes, setClasses] = useState<ClassItem[]>([]);
//   const [classId, setClassId] = useState<string>("");

//   /* ================= RTK ================= */

//   const { data: subjectsData, isLoading } = useGetSubjectsByClassQuery(
//     classId,
//     {
//       skip: !classId,
//     },
//   );
//   console.log(subjectsData, "data");

//   /* ✅ FIX */
//   const subjects: Subject[] = subjectsData?.subjects || [];

//   /* ================= LOAD CLASSES ================= */

//   useEffect(() => {
//     (async () => {
//       try {
//         const res: ClassItem[] = await getClassesApi();
//         setClasses(res || []);
//       } catch {
//         console.error("Failed to load classes");
//       }
//     })();
//   }, []);

//   /* ================= UI ================= */

//   return (
//     <Card title="Class Timetables">
//       <Select
//         placeholder="Select Class"
//         style={{ width: 250, marginBottom: 20 }}
//         onChange={setClassId}
//         options={classes.map((c) => ({
//           label: c.name,
//           value: c._id,
//         }))}
//       />

//       {isLoading && <Spin />}

//       {classId && !isLoading && (
//         // <AssignTimetable
//         //   subjects={subjects}
//         //   periods={periods}
//         //   classId={classId}
//         // />
//       )}
//     </Card>
//   );
// }

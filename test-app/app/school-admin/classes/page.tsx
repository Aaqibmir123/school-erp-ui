"use client";

import { Card } from "antd";
import ClassesForm from "@/src/modules/school-admin/classes/components/ClassesForm";
import ClassesList from "@/src/modules/school-admin/classes/components/ClassesList";

export default function ClassesPage() {
  return (
    <Card title="Classes">
      <ClassesForm />

      <div style={{ marginTop: 20 }}>
        <ClassesList />
      </div>
    </Card>
  );
}
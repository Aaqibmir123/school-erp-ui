"use client";

import { Button, Form, Input, Modal, Select } from "antd";
import { useState } from "react";

import { ISubject } from "@/shared-types/subject.types";
import { showToast } from "@/src/utils/toast";
import { useGetSubjectsByClassQuery } from "@/src/modules/school-admin/subjects/subject.api";
import { useGetClassesQuery } from "../classes/classes";
import { useAssignSubjectMutation } from "./teacherAssignment.api";
import { useGetAcademicYearsQuery } from "../academic-year/academicYear.api";

interface Props {
  open: boolean;
  onClose: () => void;
  teacher: {
    _id: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function AssignSubjectModal({ open, onClose, teacher }: Props) {
  const [form] = Form.useForm();
  const [selectedClass, setSelectedClass] = useState<string>("");

  const { data: classes = [] } = useGetClassesQuery();
  const { data: academicYears = [] } = useGetAcademicYearsQuery();
  const { data: subjectsData } = useGetSubjectsByClassQuery(selectedClass, {
    skip: !selectedClass,
  });

  const subjects: ISubject[] = subjectsData || [];
  const [assignSubject, { isLoading }] = useAssignSubjectMutation();

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    form.setFieldsValue({
      subjectId: undefined,
    });
  };

  const handleSubmit = async (values: {
    classId: string;
    subjectId: string;
    academicYearId: string;
  }) => {
    try {
      const res = await assignSubject({
        teacherId: teacher._id,
        classId: values.classId,
        subjectId: values.subjectId,
        academicYearId: values.academicYearId,
      }).unwrap();

      showToast.apiResponse(res, "Subject assigned successfully");
      form.resetFields();
      setSelectedClass("");
      onClose();
    } catch (err: any) {
      showToast.apiError(err, "Failed to assign subject");
    }
  };

  return (
    <Modal
      title="Assign Subject"
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item label="Teacher">
          <Input
            value={`${teacher?.firstName || ""} ${teacher?.lastName || ""}`.trim()}
            disabled
          />
        </Form.Item>

        <Form.Item
          label="Academic Year"
          name="academicYearId"
          rules={[{ required: true, message: "Select academic year" }]}
        >
          <Select
            placeholder="Select academic year"
            options={academicYears.map((year) => ({
              label: year.name,
              value: year._id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Class"
          name="classId"
          rules={[{ required: true, message: "Select class" }]}
        >
          <Select
            placeholder="Select Class"
            onChange={handleClassChange}
            options={classes.map((cls) => ({
              label: cls.name,
              value: cls._id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subjectId"
          rules={[{ required: true, message: "Select subject" }]}
        >
          <Select
            placeholder="Select Subject"
            disabled={!selectedClass}
            options={subjects.map((sub) => ({
              label: sub.name,
              value: sub._id,
            }))}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Assign Subject
        </Button>
      </Form>
    </Modal>
  );
}

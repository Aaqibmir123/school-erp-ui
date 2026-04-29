"use client";

import {
  Button,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
} from "antd";

import dayjs from "dayjs";
import { useCallback, useEffect } from "react";

import { showToast } from "../../../../utils/toast";

import { useGetSectionsByClassQuery } from "../../sections/sectionApi";
import {
  useCreateStudentMutation,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
} from "../studentApi";
import { useGetClassesQuery } from "../../classes/classes";

import type { Section } from "@/shared-types/section.types";
import type {
  CreateStudentDTO,
  StudentPopulated,
} from "@/shared-types/student.types";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: StudentPopulated;
}

export default function StudentDrawer({ open, onClose, initialData }: Props) {
  const [form] = Form.useForm();
  const watchedClassId = Form.useWatch("classId", form) as string | undefined;

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();

  const isLoading = creating || updating;
  const { data: classes = [] } = useGetClassesQuery();

  const { data: sections = [], isLoading: sectionsLoading } =
    useGetSectionsByClassQuery(watchedClassId || "", {
      skip: !watchedClassId,
    });

  const hasSections = sections && sections.length > 0;
  const studentId = initialData?._id ? String(initialData._id) : "";
  const { data: fullStudent } = useGetStudentByIdQuery(studentId, {
    skip: !open || !studentId,
  });

  /* ================= RESET FORM ON CLOSE ================= */
  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  /* ================= PREFILL (EDIT MODE) ================= */
  useEffect(() => {
    const student = fullStudent || initialData;
    if (!open || !student) return;

    const normalizeDate = (value?: string | Date | null) =>
      value ? dayjs(value) : undefined;

    form.setFieldsValue({
      ...student,
      classId: student.classId?._id,
      sectionId: student.sectionId?._id,
      dateOfBirth: normalizeDate(student.dateOfBirth),
      admissionDate: normalizeDate(student.admissionDate),
    });
  }, [fullStudent, initialData, open, form]);

  /* ================= SUBMIT ================= */
  const handleSubmit = useCallback(
    async (values: CreateStudentDTO) => {
      try {
        if (hasSections && !values.sectionId) {
          showToast.error("Section is required");
          return;
        }

        const payload = {
          ...values,
          dateOfBirth: values.dateOfBirth
            ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
            : undefined,
          admissionDate: values.admissionDate
            ? dayjs(values.admissionDate).format("YYYY-MM-DD")
            : undefined,
          sectionId: hasSections ? values.sectionId : undefined,
          rollNumber: Number(values.rollNumber),
        };

        if (initialData?._id) {
          await updateStudent({
            id: initialData._id,
            body: payload,
          }).unwrap();
          showToast.success("Student updated successfully");
        } else {
          await createStudent(payload).unwrap();
          showToast.success("Student created successfully");
        }

        window.dispatchEvent(new Event("students-updated"));
        window.dispatchEvent(new Event("dashboard-updated"));
        handleClose();
      } catch (err: unknown) {
        showToast.apiError(err, "Operation failed");
      }
    },
    [hasSections, initialData, createStudent, updateStudent, handleClose],
  );

  return (
    <Drawer
      title={initialData ? "Edit Student" : "Add Student"}
      size="large"
      open={open}
      onClose={handleClose}
      maskClosable={false}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* ================= STUDENT INFO ================= */}
        <Divider>Student Info</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Last Name" name="lastName">
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Gender is required" }]}
            >
              <Select
                placeholder="Select gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
              rules={[{ required: true, message: "Date of birth is required" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {/* ================= PARENT INFO ================= */}
        <Divider>Parent Info</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Father Name" name="fatherName">
              <Input placeholder="Enter father name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Parent Phone"
              name="parentPhone"
              rules={[
                { required: true, message: "Parent phone is required" },
                { pattern: /^[0-9+\-\s()]*$/, message: "Invalid phone number" },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        {/* ================= ACADEMIC INFO ================= */}
        <Divider>Academic Info</Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Class"
              name="classId"
              rules={[{ required: true, message: "Class is required" }]}
            >
              <Select
                placeholder="Select class"
                options={classes.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
                onChange={() => {
                  form.setFieldValue("sectionId", undefined);
                }}
              />
            </Form.Item>
          </Col>

          {hasSections && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Section"
                name="sectionId"
                rules={[{ required: true, message: "Section is required" }]}
              >
                <Select
                  placeholder="Select section"
                  loading={sectionsLoading}
                  options={sections.map((s: Section) => ({
                    label: s.name,
                    value: s._id,
                  }))}
                />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              label="Roll Number"
              name="rollNumber"
              rules={[
                { pattern: /^[0-9]+$/, message: "Roll number must be numeric" },
              ]}
            >
              <Input placeholder="Enter roll number" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Admission Date"
              name="admissionDate"
              rules={[
                { required: true, message: "Admission date is required" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {/* ================= SUBMIT ================= */}
        <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            {initialData ? "Update Student" : "Save Student"}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

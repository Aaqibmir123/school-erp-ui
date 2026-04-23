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
import { useCallback, useEffect, useState } from "react";

import { showToast } from "../../../../utils/toast";

import { useGetSectionsByClassQuery } from "../../sections/sectionApi";
import {
  useCreateStudentMutation,
  useUpdateStudentMutation,
} from "../studentApi";

import { getClassesApi } from "../../classes/api/class.api";

import type { Section } from "../../../../../../shared-types/section.types";
import { CreateStudentDTO } from "../../../../../../shared-types/student.types";

interface ClassItem {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function StudentDrawer({ open, onClose, initialData }: Props) {
  const [form] = Form.useForm();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [createStudent, { isLoading: creating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();

  const isLoading = creating || updating;

  const { data: sections = [], isLoading: sectionsLoading } =
    useGetSectionsByClassQuery(selectedClassId!, {
      skip: !selectedClassId,
    });

  const hasSections = sections && sections.length > 0;

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res: ClassItem[] = await getClassesApi();
        if (mounted) setClasses(res);
      } catch (err) {
        showToast.error("Failed to load classes");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= RESET FORM ON CLOSE ================= */
  const handleClose = useCallback(() => {
    form.resetFields();
    setSelectedClassId(null);
    onClose();
  }, [form, onClose]);

  /* ================= PREFILL (EDIT MODE) ================= */
  useEffect(() => {
    if (!open || !initialData) return;

    const classId = initialData.classId?._id;
    setSelectedClassId(classId);

    form.setFieldsValue({
      ...initialData,
      classId: classId,
      sectionId: initialData.sectionId?._id,
      dateOfBirth: initialData.dateOfBirth
        ? dayjs(initialData.dateOfBirth)
        : undefined,
      admissionDate: initialData.admissionDate
        ? dayjs(initialData.admissionDate)
        : undefined,
    });
  }, [initialData, open, form]);

  /* ================= RESET SECTION ================= */
  useEffect(() => {
    if (selectedClassId) {
      form.setFieldValue("sectionId", undefined);
    }
  }, [selectedClassId, form]);

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

        handleClose();
      } catch (err: any) {
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
            <Form.Item label="Date of Birth" name="dateOfBirth">
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
                onChange={setSelectedClassId}
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
            <Form.Item label="Admission Date" name="admissionDate">
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

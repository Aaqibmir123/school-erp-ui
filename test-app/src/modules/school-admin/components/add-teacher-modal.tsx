"use client";

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Upload,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
} from "../api/teacherApi";

import { showToast } from "@/src/utils/toast";
import { useEffect } from "react";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  teacher?: any; // 🔥 edit mode
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: Dayjs;
  joiningDate?: Dayjs;
  employeeId?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  profileImage?: UploadFile[];
}

export default function AddTeacherModal({ open, onClose, teacher }: Props) {
  const [form] = Form.useForm<FormValues>();

  const [createTeacher, { isLoading: creating }] = useCreateTeacherMutation();

  const [updateTeacher, { isLoading: updating }] = useUpdateTeacherMutation();

  const isEdit = !!teacher;

  /* =========================
     PREFILL (EDIT MODE)
  ========================= */
  useEffect(() => {
    if (!open) return;

    if (teacher) {
      form.setFieldsValue({
        ...teacher,
        dateOfBirth: teacher.dateOfBirth
          ? dayjs(teacher.dateOfBirth)
          : undefined,
        joiningDate: teacher.joiningDate
          ? dayjs(teacher.joiningDate)
          : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [teacher, open]);

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (values: FormValues) => {
    try {
      /* =========================
         EDIT MODE
      ========================= */
      if (isEdit) {
        const payload: any = {
          ...values,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : undefined,
          joiningDate: values.joiningDate
            ? values.joiningDate.format("YYYY-MM-DD")
            : undefined,
        };

        await updateTeacher({
          id: teacher._id,
          data: payload,
        }).unwrap();

        showToast.success("Teacher updated successfully");
      } else {
        /* =========================
         CREATE MODE
      ========================= */
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
          if (!value || key === "profileImage") return;

          if (key === "dateOfBirth" || key === "joiningDate") {
            formData.append(key, (value as Dayjs).format("YYYY-MM-DD"));
          } else {
            formData.append(key, String(value));
          }
        });

        if (values.profileImage?.length) {
          formData.append(
            "profileImage",
            values.profileImage[0].originFileObj as File,
          );
        }

        await createTeacher(formData).unwrap();

        showToast.success("Teacher created successfully");
      }

      form.resetFields();
      onClose();
    } catch (err: any) {
      message.error(err?.data?.message || "Failed");
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Modal
      title={isEdit ? "Edit Teacher" : "Add Teacher"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      forceRender
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* PROFILE IMAGE */}
        <Form.Item
          label="Profile Photo"
          name="profileImage"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <UploadOutlined />
          </Upload>
        </Form.Item>

        {/* BASIC */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input placeholder="Email" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="Phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="dateOfBirth" label="Date Of Birth">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* PROFESSIONAL */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="employeeId" label="Employee ID">
              <Input placeholder="Employee ID" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="qualification" label="Qualification">
              <Input placeholder="Qualification" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="experience" label="Experience">
              <Input placeholder="Years" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="joiningDate" label="Joining Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} placeholder="Address" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={creating || updating}
        >
          {isEdit ? "Update Teacher" : "Create Teacher"}
        </Button>
      </Form>
    </Modal>
  );
}

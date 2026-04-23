"use client";

import { UserOutlined } from "@ant-design/icons";
import { Card, Col, Divider, Drawer, message, Row, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useCreateFeeMutation, useUpdateFeeMutation } from "../feeApi";
import FeeForm from "./FeeForm";

const { Title, Text } = Typography;

export default function FeeDrawer({ open, onClose, student, editData }: any) {
  const [createFee, { isLoading }] = useCreateFeeMutation();
  const [updateFee] = useUpdateFeeMutation();

  const formRef = useRef<any>(null);

  const isEdit = !!editData;

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        studentId: student._id,
        classId: student.classId,
        sectionId: student.sectionId,
        ...formData,
      };

      if (isEdit) {
        await updateFee({ id: editData._id, ...payload }).unwrap();
        message.success("Fee updated");
      } else {
        await createFee(payload).unwrap();
        message.success("Fee added");
      }

      // 🔥 RESET
      formRef.current?.reset();

      onClose();
    } catch (err: any) {
      message.error(err?.data?.message || "Error");
    }
  };

  const handleClose = () => {
    formRef.current?.reset();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      // 🔥 drawer close → reset
      formRef.current?.reset();
    }
  }, [open]);

  useEffect(() => {
    if (open && editData) {
      // 🔥 edit mode → form refill trigger
      formRef.current?.setFields(editData);
    }
  }, [open, editData]);

  return (
    <Drawer
      title={isEdit ? "Edit Fee" : "Add Fee"}
      open={open}
      onClose={handleClose}
      size="large"
    >
      {/* STUDENT CARD */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" gutter={12}>
          <Col>
            <UserOutlined style={{ fontSize: 24, color: "#1677ff" }} />
          </Col>

          <Col>
            <Title level={5} style={{ margin: 0 }}>
              {student?.name}
            </Title>
            <Text type="secondary">
              {student?.className} - {student?.sectionName}
            </Text>
          </Col>
        </Row>
      </Card>

      <Divider />

      <FeeForm
        ref={formRef}
        initialValues={editData}
        onSubmit={handleSubmit}
        loading={isLoading}
      />
    </Drawer>
  );
}

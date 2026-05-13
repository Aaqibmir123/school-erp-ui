"use client";

import { UserOutlined } from "@ant-design/icons";
import { Card, Col, Divider, Drawer, Row, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useCreateFeeMutation, useUpdateFeeMutation } from "../feeApi";
import { showToast } from "@/src/utils/toast";
import FeeForm, {
  type FeeFormHandle,
  type FeeFormInitialValues,
  type FeeFormSubmitValues,
} from "./FeeForm";

const { Title, Text } = Typography;

type FeeStudent = {
  _id: string;
  name?: string;
  className?: string;
  sectionName?: string;
  classId?: string | { _id?: string };
  sectionId?: string | { _id?: string };
};

type FeeDrawerProps = {
  open: boolean;
  onClose: () => void;
  student: FeeStudent;
  editData?: Partial<FeeFormInitialValues> & { _id: string };
};

export default function FeeDrawer({
  open,
  onClose,
  student,
  editData,
}: FeeDrawerProps) {
  const [createFee, { isLoading }] = useCreateFeeMutation();
  const [updateFee, updateState] = useUpdateFeeMutation();

  const formRef = useRef<FeeFormHandle | null>(null);

  const isEdit = !!editData;
  const loadingState = isLoading || updateState.isLoading;

  const handleSubmit = async (formData: FeeFormSubmitValues) => {
    try {
      const payload = {
        studentId: student._id,
        classId: typeof student.classId === "string" ? student.classId : student.classId?._id,
        sectionId:
          typeof student.sectionId === "string"
            ? student.sectionId
            : student.sectionId?._id,
        ...formData,
      };

      if (isEdit) {
        await updateFee({ id: editData._id, ...payload }).unwrap();
      } else {
        await createFee(payload).unwrap();
      }

      showToast.success(isEdit ? "Fee updated" : "Fee added");
      window.dispatchEvent(new Event("dashboard-updated"));

      // 🔥 RESET
      formRef.current?.reset();

      onClose();
    } catch (err: unknown) {
      showToast.apiError(err, "Fee save failed");
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
        loading={loadingState}
      />
    </Drawer>
  );
}

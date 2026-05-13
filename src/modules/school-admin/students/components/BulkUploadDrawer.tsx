"use client";

import { App, Button, Drawer, Tag, Upload } from "antd";

import { useState } from "react";
import ResponsiveTable from "@/src/components/ResponsiveTable";

import {
  useImportStudentsMutation,
  usePreviewStudentsMutation,
} from "../studentApi";

import type {
  BulkImportResponse,
  StudentBulkTemplateRow,
} from "@/shared-types/student.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BulkUploadDrawer({ open, onClose }: Props) {
  const { message } = App.useApp();
  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<
    (StudentBulkTemplateRow & { id: number })[]
  >([]);

  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);

  const [previewStudents, { isLoading: previewLoading }] =
    usePreviewStudentsMutation();

  const [importStudents, { isLoading: importLoading }] =
    useImportStudentsMutation();

  /* RESET */
  const resetState = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  /* PREVIEW */
  const handlePreview = async () => {
    if (!file) {
      message.error("Please select excel file");
      return;
    }

    try {
      const res = await previewStudents({ file }).unwrap();

      const previewData =
        res.preview.map((item, index) => ({
          ...item,
          id: index,
        })) || [];

      setPreview(previewData);
      setErrors(res.errors || []);

      if (res.errors?.length) {
        message.warning(`${res.errors.length} rows have validation errors`);
      } else {
        message.success("Preview loaded successfully");
      }
    } catch (err: any) {
      message.error(err?.data?.message || "Preview failed");
    }
  };

  /* IMPORT */
  const handleImport = async () => {
    if (!preview.length) {
      message.warning("Nothing to import");
      return;
    }

    try {
      const payload = preview.map(({ id, ...rest }) => rest);

      const res: BulkImportResponse = await importStudents({
        students: payload,
      }).unwrap();

      if (res.failed) {
        message.error(`${res.failed} rows failed`);
        setErrors(res.errors);
      } else {
        message.success(`${res.inserted} students imported`);

        resetState();
        onClose();
      }
    } catch (err: any) {
      message.error(err?.data?.message || "Import failed");
    }
  };

  /* TABLE */
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
    },
    {
      title: "Class",
      dataIndex: "className",
    },
    {
      title: "Section",
      dataIndex: "sectionName",
    },
    {
      title: "Roll",
      dataIndex: "rollNumber",
    },
    {
      title: "Error",
      render: (_: unknown, __: unknown, index: number) => {
        const err = errors.find((e) => e.row === index + 1);

        if (!err) return null;

        return <Tag color="red">{err.message}</Tag>;
      },
    },
  ];

  return (
    <Drawer
      title="Bulk Upload Students"
      size="large"
      open={open}
      onClose={handleClose}
      destroyOnHidden
    >
      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false;
        }}
        maxCount={1}
        accept=".xlsx,.xls"
      >
        <Button>Select Excel</Button>
      </Upload>

      <Button
        style={{ marginTop: 10 }}
        onClick={handlePreview}
        loading={previewLoading}
      >
        Preview
      </Button>

      <ResponsiveTable
        style={{ marginTop: 20 }}
        columns={columns}
        dataSource={preview}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      <Button
        type="primary"
        style={{ marginTop: 20 }}
        onClick={handleImport}
        loading={importLoading}
      >
        Import Students
      </Button>
    </Drawer>
  );
}


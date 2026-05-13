"use client";

import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Button, Card, Form, Image, Upload } from "antd";

import { showToast } from "@/src/utils/toast";
import styles from "../SchoolPage.module.css";

type Props = {
  logoPreview: string | null;
  sealPreview: string | null;
  signaturePreview: string | null;
  onPreview: (file: File, type: "logo" | "signature" | "seal") => void;
};

const normalizeUpload = (event: { fileList?: UploadFile[] }) =>
  event?.fileList ?? [];

function UploadColumn({
  label,
  fieldName,
  preview,
  onPreview,
}: {
  fieldName: "logo" | "signature" | "seal";
  label: string;
  onPreview: (file: File, type: "logo" | "signature" | "seal") => void;
  preview: string | null;
}) {
  const sizeLabel = `${label} must be smaller than 2MB`;

  return (
    <Form.Item label={label}>
      <Form.Item
        name={fieldName}
        valuePropName="fileList"
        getValueFromEvent={normalizeUpload}
        noStyle
      >
        <Upload
          accept="image/*"
          beforeUpload={(file) => {
            if (file.size > 2 * 1024 * 1024) {
              showToast.warning(sizeLabel);
              return Upload.LIST_IGNORE;
            }

            onPreview(file, fieldName);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>
      {preview && <Image alt={`${label} preview`} src={preview} style={{ marginTop: 12 }} />}
    </Form.Item>
  );
}

export default function SchoolAssetsSection({
  logoPreview,
  sealPreview,
  signaturePreview,
  onPreview,
}: Props) {
  return (
    <Card variant="borderless" className={styles.sectionCard} title="School Branding">
      <div className={styles.assetGrid}>
        <UploadColumn
          fieldName="logo"
          label="School Logo"
          preview={logoPreview}
          onPreview={onPreview}
        />
        <UploadColumn
          fieldName="signature"
          label="Signature"
          preview={signaturePreview}
          onPreview={onPreview}
        />
        <UploadColumn
          fieldName="seal"
          label="Seal"
          preview={sealPreview}
          onPreview={onPreview}
        />
      </div>
    </Card>
  );
}


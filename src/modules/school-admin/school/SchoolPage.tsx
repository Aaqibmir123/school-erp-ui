"use client";

import { Button, Card, Col, Form, Image, Input, Row, Upload } from "antd";
import type { UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/src/utils/toast";

import { useCreateSchoolMutation } from "./school.api";
import { useSchool } from "./useSchool";
import styles from "./SchoolPage.module.css";

type SchoolFormValues = {
  address?: string;
  logo?: UploadFile[];
  name: string;
  seal?: UploadFile[];
  signature?: UploadFile[];
};

const normalizeUpload = (event: { fileList?: UploadFile[] }) =>
  event?.fileList ?? [];

const SchoolPage = () => {
  const [form] = Form.useForm<SchoolFormValues>();
  const router = useRouter();
  const { school } = useSchool();
  const [saving, setSaving] = useState(false);
  const [createSchool] = useCreateSchoolMutation();

  const [previewOverrides, setPreviewOverrides] = useState<{
    logo?: string;
    seal?: string;
    signature?: string;
  }>({});
  const [autoClean, setAutoClean] = useState(true);

  const handlePreview = (file: File, type: "logo" | "signature" | "seal") => {
    const url = URL.createObjectURL(file);
    setPreviewOverrides((current) => ({
      ...current,
      [type]: url,
    }));
  };

  useEffect(() => {
    if (!school) return;

    form.setFieldsValue({
      address: school.address || "",
      name: school.name || school.schoolName || "",
    });
  }, [form, school]);

  const logoPreview = useMemo(
    () => previewOverrides.logo ?? school?.logo ?? null,
    [previewOverrides.logo, school?.logo],
  );
  const signaturePreview = useMemo(
    () => previewOverrides.signature ?? school?.signature ?? null,
    [previewOverrides.signature, school?.signature],
  );
  const sealPreview = useMemo(
    () => previewOverrides.seal ?? school?.seal ?? null,
    [previewOverrides.seal, school?.seal],
  );

  const onFinish = async (values: SchoolFormValues) => {
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("address", values.address || "");
      formData.append("autoClean", String(autoClean));

      const logoFile = values.logo?.[0]?.originFileObj;
      const signatureFile = values.signature?.[0]?.originFileObj;
      const sealFile = values.seal?.[0]?.originFileObj;

      if (logoFile) formData.append("logo", logoFile);
      if (signatureFile) formData.append("signature", signatureFile);
      if (sealFile) formData.append("seal", sealFile);

      await createSchool(formData).unwrap();

      window.dispatchEvent(new Event("school-profile-updated"));
      showToast.success("School saved successfully");
      router.replace("/school-admin");
      router.refresh();
    } catch (error) {
      showToast.apiError(error, "Failed to save school");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} lg={18}>
        <Card
          variant="borderless"
          title="School Profile"
          extra={
            <Button type="link" onClick={() => router.push("/school-admin/settings")}>
              Open Time Management
            </Button>
          }
          className={styles.sectionCard}
        >
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="name"
              label="School Name"
              rules={[{ required: true, message: "School name is required" }]}
            >
              <Input placeholder="Green Valley School" size="large" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input placeholder="School address" size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                type={autoClean ? "primary" : "default"}
                onClick={() => setAutoClean((value) => !value)}
              >
                Auto remove background {autoClean ? "On" : "Off"}
              </Button>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="School Logo">
                  <Form.Item
                    name="logo"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUpload}
                    noStyle
                  >
                    <Upload
                      accept="image/*"
                      beforeUpload={(file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          showToast.warning("Logo must be smaller than 2MB");
                          return Upload.LIST_IGNORE;
                        }

                        handlePreview(file, "logo");
                        return false;
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                  {logoPreview && (
                    <Image alt="Logo preview" src={logoPreview} style={{ marginTop: 12 }} />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Signature">
                  <Form.Item
                    name="signature"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUpload}
                    noStyle
                  >
                    <Upload
                      accept="image/*"
                      beforeUpload={(file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          showToast.warning("Signature must be smaller than 2MB");
                          return Upload.LIST_IGNORE;
                        }

                        handlePreview(file, "signature");
                        return false;
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                  {signaturePreview && (
                    <Image
                      alt="Signature preview"
                      src={signaturePreview}
                      style={{ marginTop: 12 }}
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Seal">
                  <Form.Item
                    name="seal"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUpload}
                    noStyle
                  >
                    <Upload
                      accept="image/*"
                      beforeUpload={(file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          showToast.warning("Seal must be smaller than 2MB");
                          return Upload.LIST_IGNORE;
                        }

                        handlePreview(file, "seal");
                        return false;
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                  {sealPreview && (
                    <Image alt="Seal preview" src={sealPreview} style={{ marginTop: 12 }} />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <div className={styles.footerRow}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.saveBtn}
                loading={saving}
              >
                Save School Profile
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default SchoolPage;

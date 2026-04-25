"use client";

import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Button, Card, Checkbox, Col, Form, Image, Input, Row, Upload } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useSchool } from "./useSchool";
import { showToast } from "@/src/utils/toast";
import { createSchoolApi } from "./school.api";

type SchoolFormValues = {
  address?: string;
  logo?: UploadFile[];
  name: string;
  seal?: UploadFile[];
  signature?: UploadFile[];
};

const SchoolPage = () => {
  const [form] = Form.useForm<SchoolFormValues>();
  const router = useRouter();
  const { school } = useSchool();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);
  const [autoClean, setAutoClean] = useState(true);

  const normalizeUpload = (event: { fileList?: UploadFile[] }) =>
    event?.fileList ?? [];

  const handlePreview = (file: File, type: "logo" | "signature" | "seal") => {
    // Create a lightweight preview URL so the admin can verify the image immediately
    // before saving the school profile.
    const url = URL.createObjectURL(file);

    if (type === "logo") setLogoPreview(url);
    if (type === "signature") setSignaturePreview(url);
    if (type === "seal") setSealPreview(url);
  };

  useEffect(() => {
    if (!school) return;

    form.setFieldsValue({
      address: school.address || "",
      name: school.name || school.schoolName || "",
    });

    setLogoPreview(school.logo || null);
    setSignaturePreview(school.signature || null);
    setSealPreview(school.seal || null);
  }, [form, school]);

  const onFinish = async (values: SchoolFormValues) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("address", values.address || "");
      formData.append("autoClean", String(autoClean));

      const logoFile = values.logo?.[0]?.originFileObj;
      const signatureFile = values.signature?.[0]?.originFileObj;
      const sealFile = values.seal?.[0]?.originFileObj;

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (signatureFile) {
        formData.append("signature", signatureFile);
      }

      if (sealFile) {
        formData.append("seal", sealFile);
      }

      await createSchoolApi(formData);

      window.dispatchEvent(new Event("school-profile-updated"));
      showToast.success("School saved successfully");
      router.replace("/school-admin");
      router.refresh();
    } catch (error) {
      showToast.apiError(error, "Failed to save school");
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} md={18}>
        <Card variant="borderless" title="School Setup">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="name"
              label="School Name"
              rules={[{ required: true, message: "School name is required" }]}
            >
              <Input placeholder="Green Valley School" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input placeholder="School address" />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={autoClean}
                onChange={(e) => setAutoClean(e.target.checked)}
              >
                Auto remove background
              </Checkbox>
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
                    <Image
                      alt="Logo preview"
                      src={logoPreview}
                      style={{ marginTop: 12 }}
                    />
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
                          showToast.warning(
                            "Signature must be smaller than 2MB",
                          );
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
                    <Image
                      alt="Seal preview"
                      src={sealPreview}
                      style={{ marginTop: 12 }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" block>
              Save
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default SchoolPage;

"use client";

import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Image,
  Input,
  Row,
  Upload,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSchoolApi } from "./school.api";

const SchoolPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [sealPreview, setSealPreview] = useState<string | null>(null);

  const [autoClean, setAutoClean] = useState(true); // 🔥 NEW

  const handlePreview = (file: any, type: string) => {
    const url = URL.createObjectURL(file);

    if (type === "logo") setLogoPreview(url);
    if (type === "signature") setSignaturePreview(url);
    if (type === "seal") setSealPreview(url);
  };

  const onFinish = async (values: any) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("address", values.address || "");

      // 🔥 send flag
      formData.append("autoClean", String(autoClean));

      if (values.logo?.file) {
        formData.append("logo", values.logo.file);
      }

      if (values.signature?.file) {
        formData.append("signature", values.signature.file);
      }

      if (values.seal?.file) {
        formData.append("seal", values.seal.file);
      }

      await createSchoolApi(formData);

      message.success("School saved successfully ✅");
      router.push("/school-admin");
    } catch (err) {
      console.error(err);
      message.error("Failed ❌");
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} md={18}>
        <Card title="🏫 School Setup">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              name="name"
              label="School Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>

            {/* 🔥 AUTO CLEAN TOGGLE */}
            <Form.Item>
              <Checkbox
                checked={autoClean}
                onChange={(e) => setAutoClean(e.target.checked)}
              >
                Auto remove background (recommended)
              </Checkbox>
            </Form.Item>

            <Row gutter={16}>
              {/* LOGO */}
              <Col span={8}>
                <Form.Item name="logo" label="Logo">
                  <Upload
                    beforeUpload={(file) => {
                      handlePreview(file, "logo");
                      return false;
                    }}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                  {logoPreview && <Image src={logoPreview} />}
                </Form.Item>
              </Col>

              {/* SIGNATURE */}
              <Col span={8}>
                <Form.Item name="signature" label="Signature">
                  <Upload
                    beforeUpload={(file) => {
                      handlePreview(file, "signature");
                      return false;
                    }}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                  {signaturePreview && <Image src={signaturePreview} />}
                </Form.Item>
              </Col>

              {/* SEAL */}
              <Col span={8}>
                <Form.Item name="seal" label="Seal">
                  <Upload
                    beforeUpload={(file) => {
                      handlePreview(file, "seal");
                      return false;
                    }}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                  {sealPreview && <Image src={sealPreview} />}
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

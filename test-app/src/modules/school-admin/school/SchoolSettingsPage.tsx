"use client";

import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Button, Col, Form, Row, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BrandLoader from "@/src/components/BrandLoader";
import SchoolTimingSection from "./components/SchoolTimingSection";
import { createSchoolApi } from "./school.api";
import { useSchool } from "./useSchool";
import {
  SchoolTimingFormValues,
  SchoolTimingSettings,
  WeekdayValue,
} from "./schoolSettings.types";
import styles from "./SchoolPage.module.css";
import { showToast } from "@/src/utils/toast";

const { Title } = Typography;

dayjs.extend(customParseFormat);

const DEFAULT_WORKING_DAYS: WeekdayValue[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const normalizeWorkingDays = (value?: string[]) =>
  (Array.isArray(value) ? value : DEFAULT_WORKING_DAYS) as WeekdayValue[];

const isValidTime = (value?: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value || "");

const parseTimeValue = (value?: string) => {
  if (!value || !isValidTime(value)) return null;
  return dayjs(value, "HH:mm");
};

const formatTimeValue = (value?: Dayjs | null) => (value ? value.format("HH:mm") : "");

export default function SchoolSettingsPage() {
  const [form] = Form.useForm<SchoolTimingFormValues>();
  const router = useRouter();
  const { school, loading } = useSchool();
  const [saving, setSaving] = useState(false);

  const timingDefaults = useMemo<Partial<SchoolTimingSettings>>(
    () => ({
      checkInCloseTime: "09:00",
      checkInOpenTime: "07:30",
      checkOutCloseTime: "16:00",
      lateMarkAfterTime: "08:15",
      schoolEndTime: "15:00",
      schoolStartTime: "08:00",
      workingDays: DEFAULT_WORKING_DAYS,
    }),
    [],
  );

  useEffect(() => {
    if (loading) return;

    const sourceTimings = {
      checkInCloseTime: school?.checkInCloseTime || timingDefaults.checkInCloseTime,
      checkInOpenTime: school?.checkInOpenTime || timingDefaults.checkInOpenTime,
      checkOutCloseTime:
        school?.checkOutCloseTime || timingDefaults.checkOutCloseTime,
      lateMarkAfterTime:
        school?.lateMarkAfterTime || timingDefaults.lateMarkAfterTime,
      schoolEndTime: school?.schoolEndTime || timingDefaults.schoolEndTime,
      schoolStartTime: school?.schoolStartTime || timingDefaults.schoolStartTime,
      workingDays: normalizeWorkingDays(school?.workingDays),
    };

    form.setFieldsValue({
      checkInCloseTime: parseTimeValue(sourceTimings.checkInCloseTime),
      checkInOpenTime: parseTimeValue(sourceTimings.checkInOpenTime),
      checkOutCloseTime: parseTimeValue(sourceTimings.checkOutCloseTime),
      lateMarkAfterTime: parseTimeValue(sourceTimings.lateMarkAfterTime),
      schoolEndTime: parseTimeValue(sourceTimings.schoolEndTime),
      schoolStartTime: parseTimeValue(sourceTimings.schoolStartTime),
      workingDays: sourceTimings.workingDays,
    });
  }, [form, loading, school, timingDefaults]);

  const onFinish = async (values: SchoolTimingFormValues) => {
    const payload: SchoolTimingSettings = {
      checkInCloseTime: formatTimeValue(values.checkInCloseTime),
      checkInOpenTime: formatTimeValue(values.checkInOpenTime),
      checkOutCloseTime: formatTimeValue(values.checkOutCloseTime),
      lateMarkAfterTime: formatTimeValue(values.lateMarkAfterTime),
      schoolEndTime: formatTimeValue(values.schoolEndTime),
      schoolStartTime: formatTimeValue(values.schoolStartTime),
      workingDays: values.workingDays,
    };

    const requiredTimes = [
      ["Check-in opens", payload.checkInOpenTime],
      ["School starts", payload.schoolStartTime],
      ["Late mark after", payload.lateMarkAfterTime],
      ["Check-in closes", payload.checkInCloseTime],
      ["School ends", payload.schoolEndTime],
      ["Check-out closes", payload.checkOutCloseTime],
    ] as const;

    for (const [label, time] of requiredTimes) {
      if (!isValidTime(time)) {
        showToast.error(`${label} must use HH:mm format`);
        return;
      }
    }

    if (
      !payload.workingDays ||
      payload.workingDays.length === 0 ||
      !(
        payload.checkInOpenTime &&
        payload.schoolStartTime &&
        payload.lateMarkAfterTime &&
        payload.checkInCloseTime &&
        payload.schoolEndTime &&
        payload.checkOutCloseTime
      )
    ) {
      showToast.error("Please fill all school time settings");
      return;
    }

    if (
      !(
        payload.checkInOpenTime <= payload.schoolStartTime &&
        payload.schoolStartTime <= payload.lateMarkAfterTime &&
        payload.lateMarkAfterTime <= payload.checkInCloseTime &&
        payload.checkInCloseTime <= payload.schoolEndTime &&
        payload.schoolEndTime <= payload.checkOutCloseTime
      )
    ) {
      showToast.error("Please keep the time order from check-in to check-out");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", school?.name || school?.schoolName || "School");
      formData.append("address", school?.address || "");
      formData.append("checkInOpenTime", payload.checkInOpenTime || "");
      formData.append("schoolStartTime", payload.schoolStartTime || "");
      formData.append("lateMarkAfterTime", payload.lateMarkAfterTime || "");
      formData.append("checkInCloseTime", payload.checkInCloseTime || "");
      formData.append("schoolEndTime", payload.schoolEndTime || "");
      formData.append("checkOutCloseTime", payload.checkOutCloseTime || "");
      formData.append("workingDays", JSON.stringify(payload.workingDays || []));

      await createSchoolApi(formData);
      window.dispatchEvent(new Event("school-profile-updated"));
      showToast.success("School settings updated");
    } catch (error) {
      showToast.apiError(error, "Unable to save school settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Row justify="center">
      <Col xs={24} lg={18}>
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
            <Col>
              <Title level={3} style={{ marginBottom: 0 }}>
                School Time Management
              </Title>
            </Col>
            <Col>
              <Button type="link" onClick={() => router.push("/school-admin/school")}>
                Back to School Profile
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
              <BrandLoader compact />
            </div>
          ) : (
            <SchoolTimingSection />
          )}

          <div className={styles.footerRow}>
            <Button
              type="primary"
              htmlType="submit"
              className={styles.saveBtn}
              loading={saving}
              disabled={loading}
            >
              Save School Settings
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
}

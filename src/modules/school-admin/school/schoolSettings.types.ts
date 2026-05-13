import type { Dayjs } from "dayjs";
import type { UploadFile } from "antd";

export type WeekdayValue =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export const WEEKDAY_OPTIONS: { label: string; value: WeekdayValue }[] = [
  { label: "Mon", value: "Mon" },
  { label: "Tue", value: "Tue" },
  { label: "Wed", value: "Wed" },
  { label: "Thu", value: "Thu" },
  { label: "Fri", value: "Fri" },
  { label: "Sat", value: "Sat" },
  { label: "Sun", value: "Sun" },
];

export type SchoolTimingSettings = {
  checkInOpenTime?: string;
  checkInCloseTime?: string;
  checkOutCloseTime?: string;
  lateMarkAfterTime?: string;
  schoolEndTime?: string;
  schoolStartTime?: string;
  workingDays?: WeekdayValue[];
};

export type SchoolTimingFormValues = {
  checkInOpenTime?: Dayjs | null;
  checkInCloseTime?: Dayjs | null;
  checkOutCloseTime?: Dayjs | null;
  lateMarkAfterTime?: Dayjs | null;
  schoolEndTime?: Dayjs | null;
  schoolStartTime?: Dayjs | null;
  workingDays?: WeekdayValue[];
};

export type SchoolFormValues = {
  address?: string;
  autoClean?: boolean;
  logo?: UploadFile[];
  name: string;
  seal?: UploadFile[];
  signature?: UploadFile[];
} & SchoolTimingSettings;

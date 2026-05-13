export type TransportVehicleType = "bus" | "van" | "car" | "mini-bus" | "other";

export type TransportSalaryStatus = "paid" | "partial" | "pending";

export type TransportRecordStatus = "active" | "inactive";

export interface TransportRecord {
  _id: string;
  routeName: string;
  vehicleNumber: string;
  vehicleType: TransportVehicleType;
  capacity: number;
  driverName: string;
  driverPhone: string;
  driverSalary: number;
  salaryPaidAmount: number;
  salaryDueAmount: number;
  salaryStatus: TransportSalaryStatus;
  salaryPaidDate?: string | null;
  status: TransportRecordStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportPayload {
  routeName: string;
  vehicleNumber: string;
  vehicleType: TransportVehicleType;
  capacity: number;
  driverName: string;
  driverPhone: string;
  driverSalary: number;
  salaryPaidAmount?: number;
  salaryStatus?: TransportSalaryStatus;
  status?: TransportRecordStatus;
  notes?: string;
}

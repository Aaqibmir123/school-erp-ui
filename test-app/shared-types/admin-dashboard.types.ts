import type { TransportRecord } from "./transport.types";

export interface AdminDashboardSummary {
  counts: {
    students: number;
    teachers: number;
    classes: number;
    sections: number;
    subjects: number;
    transports: number;
    activeTransports: number;
  };
  finance: {
    collected: number;
    due: number;
    total: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    teacherPayrollEstimate: number;
    transportSalaryPaid: number;
    transportSalaryDue: number;
    transportSalaryTotal: number;
  };
  charts: {
    monthlyFeeTrend: Array<{
      month: string;
      collected: number;
      due: number;
    }>;
    transportStatusBreakdown: Array<{
      name: string;
      value: number;
    }>;
    revenueMix: Array<{
      name: string;
      value: number;
    }>;
  };
  recentTransports: TransportRecord[];
  generatedAt: string;
}

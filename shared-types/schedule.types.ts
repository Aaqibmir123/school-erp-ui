export interface ISchedule {
  _id: string;

  schoolId: string;
  examId: string;
  classId: string;
  subjectId: string;
  teacherId?: { _id: string; firstName?: string; lastName?: string } | string | null;
  sectionId?: { _id: string; name: string } | string | null;
  inchargeTeacherId?: { _id: string; firstName?: string; lastName?: string } | string | null;

  date: string;
  startTime: string;
  endTime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateSchedule {
  examId: string;
  classId: string;
  subjectId: string;
  sectionId?: string;
  inchargeTeacherId?: string;
  date: string;
  startTime: string;
  endTime: string;
}

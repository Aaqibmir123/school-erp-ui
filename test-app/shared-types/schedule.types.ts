export interface ISchedule {
  _id: string;

  schoolId: string;
  examId: string;
  classId: string;
  subjectId: string;

  date: string;
  startTime: string;
  endTime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateSchedule {
  examId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
}

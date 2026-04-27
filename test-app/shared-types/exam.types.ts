export interface IExam {
  _id: string;
  name: string;
  isPublished?: boolean;
  academicYearId?: string;
  examType: string;
  totalMarks: number;
  startDate: string;
  endDate: string;
}

export interface ICreateExam {
  name: string;
  examType: string;
  totalMarks: number;
  startDate: string;
  endDate: string;
}

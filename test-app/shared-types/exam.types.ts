export interface IExam {
  _id: string;
  name: string;
  isPublished?: boolean;
  startDate: string;
  endDate: string;
}

export interface ICreateExam {
  name: string;
}

export interface IResultView {
  school: {
    name: string;
    logo: string;
    address?: string;
    signature?: string;
    seal?: string;
  };
  student: {
    name: string;
    className: string;
    rollNumber?: string;
  };
  exam: {
    name: string;
  };
  subjects: {
    name: string;
    marksObtained: number;
    totalMarks: number;
  }[];
}

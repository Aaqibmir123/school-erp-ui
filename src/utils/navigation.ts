export type RootStackParamList = {
  ExamAction: { examId: string; subjectId: string; classId: string };
  ExamAttendance: { examId: string; subjectId: string; classId: string };
  ExamMarks: {
    examId: string;
    subjectId: string;
    classId: string;
    sectionId?: string | null;
    totalMarks?: number;
    examName?: string;
    className?: string;
    sectionName?: string;
  };
};

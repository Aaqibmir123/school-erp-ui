"use client";

import { Card, Col, Empty, Input, Row, Select, Statistic, Table, Tag, Typography } from "antd";
import { useMemo, useState } from "react";

import { useGetAcademicYearsQuery } from "../assign-subject/teacherAssignment.api";
import { useGetClassesQuery } from "../classes/classes";
import { useGetExamsQuery } from "../exam/exam.api";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useGetSubjectsByClassQuery } from "../subjects/subject.api";
import { useGetResultsHistoryQuery } from "./results.api";

const { Text } = Typography;

export default function ResultsPage() {
  const [examId, setExamId] = useState<string>();
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [subjectId, setSubjectId] = useState<string>();
  const [academicYearId, setAcademicYearId] = useState<string>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: exams = [], isLoading: examsLoading } = useGetExamsQuery();
  const { data: academicYears = [], isLoading: yearsLoading } = useGetAcademicYearsQuery();
  const { data: classes = [], isLoading: classesLoading } = useGetClassesQuery();
  const { data: sections = [], isLoading: sectionsLoading } = useGetSectionsByClassQuery(
    classId || "",
    { skip: !classId },
  );
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsByClassQuery(
    classId || "",
    { skip: !classId },
  );

  const { data: historyData, isLoading: historyLoading } = useGetResultsHistoryQuery({
    examId,
    classId,
    sectionId,
    subjectId,
    search: search || undefined,
    page,
    limit: 20,
  });

  const historyRows = useMemo(() => {
    const items = historyData?.data || [];

    if (!academicYearId) {
      return items;
    }

    return items.filter((row: any) => {
      const rowYearId =
        row.examId?.academicYearId?._id ||
        row.examId?.academicYearId ||
        row.academicYearId?._id ||
        row.academicYearId;

      return String(rowYearId || "") === academicYearId;
    });
  }, [historyData?.data, academicYearId]);

  return (
    <Card title="Student Results Records">
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter by academic year"
            loading={yearsLoading}
            value={academicYearId}
            style={{ width: "100%" }}
            options={academicYears.map((year) => ({
              label: `${year.name}${year.isActive ? " (Active)" : ""}`,
              value: year._id,
            }))}
            onChange={(value) => {
              setAcademicYearId(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter by exam"
            loading={examsLoading}
            value={examId}
            style={{ width: "100%" }}
            options={exams.map((exam) => ({
              label: `${exam.name} (${exam.examType})`,
              value: exam._id,
            }))}
            onChange={(value) => {
              setExamId(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter by class"
            loading={classesLoading}
            value={classId}
            style={{ width: "100%" }}
            options={classes.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value) => {
              setClassId(value);
              setSectionId(undefined);
              setSubjectId(undefined);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter by section"
            disabled={!classId}
            loading={sectionsLoading}
            value={sectionId}
            style={{ width: "100%" }}
            options={sections.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value) => {
              setSectionId(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter by subject"
            disabled={!classId}
            loading={subjectsLoading}
            value={subjectId}
            style={{ width: "100%" }}
            options={subjects.map((item: any) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value) => {
              setSubjectId(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={10}>
          <Input.Search
            allowClear
            placeholder="Search student name or roll number"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Result records" value={historyData?.meta?.total || 0} />
        </Col>
      </Row>

      <Table
        rowKey="_id"
        loading={historyLoading}
        dataSource={historyRows}
        pagination={{
          current: page,
          pageSize: 20,
          total: historyData?.meta?.total || 0,
          onChange: (nextPage) => setPage(nextPage),
        }}
        locale={{
          emptyText: (
            <Empty description="No result records found for the selected filters" />
          ),
        }}
        columns={[
          {
            title: "Student",
            render: (_: unknown, row: any) => (
              <div>
                <strong>
                  {`${row.studentId?.firstName || ""} ${row.studentId?.lastName || ""}`.trim() ||
                    "Student"}
                </strong>
                <div>
                  <Text type="secondary">Roll #{row.studentId?.rollNumber || "N/A"}</Text>
                </div>
              </div>
            ),
          },
          {
            title: "Class",
            render: (_: unknown, row: any) => row.classId?.name || "-",
          },
          {
            title: "Section",
            render: (_: unknown, row: any) => row.sectionId?.name || "All",
          },
          {
            title: "Exam",
            render: (_: unknown, row: any) => row.examId?.name || "-",
          },
          {
            title: "Subject",
            render: (_: unknown, row: any) => row.subjectId?.name || "-",
          },
          {
            title: "Marks",
            render: (_: unknown, row: any) =>
              `${row.marksObtained ?? 0} / ${row.totalMarks ?? 0}`,
          },
          {
            title: "Academic Year",
            render: (_: unknown, row: any) => {
              const yearName =
                row.examId?.academicYearId?.name ||
                row.academicYearId?.name ||
                row.academicYearName;

              return yearName ? <Tag color="blue">{yearName}</Tag> : <Tag>—</Tag>;
            },
          },
        ]}
      />
    </Card>
  );
}

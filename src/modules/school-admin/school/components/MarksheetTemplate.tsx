"use client";

import { IResultView } from "./types";

const MarksheetTemplate = ({ data }: { data: IResultView }) => {
  const totalObtained = data.subjects.reduce(
    (sum, s) => sum + s.marksObtained,
    0,
  );

  const totalMarks = data.subjects.reduce((sum, s) => sum + s.totalMarks, 0);

  const percentage = ((totalObtained / totalMarks) * 100).toFixed(2);

  return (
    <div
      style={{
        width: 800,
        margin: "auto",
        background: "#fff",
        padding: 30,
        fontFamily: "Arial",
        border: "1px solid #ddd",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {data.school.logo && (
          <img src={data.school.logo} style={{ width: 60 }} />
        )}
        <h2 style={{ margin: 5 }}>{data.school.name}</h2>
        <p style={{ color: "#777" }}>{data.school.address}</p>
      </div>

      {/* TITLE */}
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>
        Student Performance Report
      </h3>

      {/* STUDENT INFO */}
      <div style={{ marginBottom: 20 }}>
        <p>
          <b>Name:</b> {data.student.name}
        </p>
        <p>
          <b>Class:</b> {data.student.className}
        </p>
        <p>
          <b>Exam:</b> {data.exam.name}
        </p>
      </div>

      {/* TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
        }}
      >
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>Subject</th>
            <th style={th}>Marks</th>
            <th style={th}>Total</th>
          </tr>
        </thead>

        <tbody>
          {data.subjects.map((sub, i) => (
            <tr key={i}>
              <td style={td}>{sub.name}</td>
              <td style={td}>{sub.marksObtained}</td>
              <td style={td}>{sub.totalMarks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div style={{ marginBottom: 30 }}>
        <p>
          <b>Total:</b> {totalObtained} / {totalMarks}
        </p>
        <p>
          <b>Percentage:</b> {percentage}%
        </p>
      </div>

      {/* FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center" }}>
          {data.school.signature && (
            <img src={data.school.signature} style={{ height: 50 }} />
          )}
          <p>Signature</p>
        </div>

        <div style={{ textAlign: "center" }}>
          {data.school.seal && (
            <img src={data.school.seal} style={{ height: 60 }} />
          )}
          <p>School Seal</p>
        </div>
      </div>
    </div>
  );
};

const th = {
  border: "1px solid #ddd",
  padding: 10,
  textAlign: "left" as const,
};

const td = {
  border: "1px solid #ddd",
  padding: 10,
};

export default MarksheetTemplate;

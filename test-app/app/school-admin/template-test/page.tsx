"use client";

import api from "@/src/services/api";
import { useEffect, useState } from "react";

export default function TemplateTestPage() {
  const [type, setType] = useState<"exam" | "final">("exam");
  const [data, setData] = useState<any>(null);

  const examId = "PUT_REAL_EXAM_ID"; // 🔥 replace

  useEffect(() => {
    if (type === "exam") {
      fetchExamResult();
    }
  }, [type]);

  const fetchExamResult = async () => {
    try {
      const res = await api.get(`/result/${examId}`);
      console.log("API DATA:", res.data);
      setData(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* 🔥 TOGGLE */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setType("exam")}>Exam Template</button>
        <button onClick={() => setType("final")} style={{ marginLeft: 10 }}>
          Final Report 🔥
        </button>
      </div>

      {/* ================= EXAM TEMPLATE ================= */}
      {type === "exam" && (
        <>
          {!data ? (
            <p>Loading...</p>
          ) : (
            <div style={container}>
              <h2 style={{ textAlign: "center" }}>ABC Public School</h2>
              <h3 style={{ textAlign: "center" }}>
                Student Performance Report
              </h3>

              <p>
                <b>Exam:</b> {data.exam}
              </p>

              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Subject</th>
                    <th style={th}>Marks</th>
                    <th style={th}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {data.subjects?.map((s: any, i: number) => (
                    <tr key={i}>
                      <td style={td}>{s.name}</td>
                      <td style={td}>{s.marksObtained}</td>
                      <td style={td}>{s.totalMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p>
                <b>Total:</b> {data.totalObtained} / {data.totalMarks}
              </p>
              <p>
                <b>Percentage:</b> {Number(data.percentage || 0).toFixed(2)}%
              </p>
            </div>
          )}
        </>
      )}

      {/* ================= FINAL TEMPLATE ================= */}
      {type === "final" && (
        <div style={container}>
          <h2 style={{ textAlign: "center" }}>ABC Public School</h2>
          <h3 style={{ textAlign: "center" }}>Final Report Card 🔥</h3>

          {/* 🔥 STATIC FOR NOW */}
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Subject</th>
                <th style={th}>Test</th>
                <th style={th}>Mid</th>
                <th style={th}>Final</th>
                <th style={th}>Score</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td style={td}>Math</td>
                <td style={td}>20</td>
                <td style={td}>60</td>
                <td style={td}>70</td>
                <td style={td}>69</td>
              </tr>

              <tr>
                <td style={td}>Science</td>
                <td style={td}>18</td>
                <td style={td}>70</td>
                <td style={td}>75</td>
                <td style={td}>72</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  width: 800,
  margin: "auto",
  background: "#fff",
  padding: 20,
  border: "1px solid #ddd",
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: 20,
};

const th = {
  border: "1px solid #ddd",
  padding: 10,
  background: "#f5f5f5",
};

const td = {
  border: "1px solid #ddd",
  padding: 10,
};

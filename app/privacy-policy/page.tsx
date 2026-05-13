const sections = [
  {
    title: "Information we collect",
    items: [
      "Account details such as name, phone number, email address, role, and school affiliation.",
      "Authentication data such as OTP session identifiers, access tokens, and refresh tokens.",
      "School usage data such as attendance, fees, timetable, notices, results, homework, and profile updates.",
      "Technical data such as device type, app version, crash logs, and network diagnostics for reliability.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "To sign users in securely and keep accounts restricted to approved roles.",
      "To provide school ERP features including attendance, exams, homework, fees, notices, and reports.",
      "To improve app stability, security, support, and performance.",
      "To comply with legal, school administration, and operational requirements.",
    ],
  },
  {
    title: "Sharing and disclosure",
    items: [
      "We do not sell personal data.",
      "Data may be shared with the relevant school administration and authorized staff for school operations.",
      "We may share data with service providers that help us run the app, host infrastructure, or send OTPs, subject to safeguards.",
      "We may disclose data if required by law or to protect users, the school, or the service.",
    ],
  },
  {
    title: "Data retention and security",
    items: [
      "We keep data only for as long as needed to provide the service and meet legal or operational needs.",
      "We use access controls, secure transport, and token/session handling to protect user accounts.",
      "Users should keep their account credentials and device access secure.",
    ],
  },
  {
    title: "Children's privacy",
    items: [
      "This app is intended for school operations and may involve student-related information managed by the school and parents.",
      "We do not knowingly collect data from children without school or guardian context required for the service.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main
      style={{
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.10), transparent 34%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        minHeight: "100vh",
        padding: "32px 20px 48px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(191,219,254,0.7)",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          margin: "0 auto",
          maxWidth: 960,
          padding: "28px clamp(20px, 4vw, 36px)",
        }}
      >
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "14px 0 12px" }}>
          Privacy Policy
        </h1>

        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 24 }}>
          Smart School ERP respects your privacy. This policy explains how we collect,
          use, store, and protect information when you use our web and mobile services.
          By using the app, you agree to the practices described below.
        </p>

        <div style={{ display: "grid", gap: 18 }}>
          {sections.map((section) => (
            <section
              key={section.title}
              style={{
                background: "#F8FBFF",
                border: "1px solid rgba(148,163,184,0.16)",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <h2 style={{ fontSize: 20, margin: "0 0 12px" }}>{section.title}</h2>
              <ul style={{ color: "#334155", lineHeight: 1.7, margin: 0, paddingLeft: 20 }}>
                {section.items.map((item) => (
                  <li key={item} style={{ marginBottom: 8 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(14,165,233,0.08))",
            border: "1px solid rgba(37,99,235,0.16)",
            borderRadius: 18,
            marginTop: 18,
            padding: 18,
          }}
        >
          <h2 style={{ fontSize: 20, margin: "0 0 10px" }}>Contact</h2>
          <p style={{ color: "#334155", lineHeight: 1.7, margin: 0 }}>
            For privacy questions or requests, contact{" "}
            <a href="mailto:miraaqib514@gmail.com" style={{ color: "#2563EB", fontWeight: 700 }}>
              miraaqib514@gmail.com
            </a>
            .
          </p>
          <p style={{ color: "#475569", lineHeight: 1.7, margin: "10px 0 0" }}>
            Website:{" "}
            <a href="https://smartschoolerp.co.in" style={{ color: "#2563EB", fontWeight: 700 }}>
              smartschoolerp.co.in
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

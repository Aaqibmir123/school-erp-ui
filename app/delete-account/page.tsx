import type { Metadata } from "next";

import DeleteAccountForm from "@/src/modules/delete-account/DeleteAccountForm";

export const metadata: Metadata = {
  description:
    "Request deletion of your Smart School ERP account and associated data.",
  title: "Delete Smart School ERP Account",
};

export default function DeleteAccountPage() {
  return (
    <main
      style={{
        background:
          "radial-gradient(circle at top, rgba(29,78,216,0.12), transparent 36%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        minHeight: "100vh",
        padding: "32px 20px 48px",
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: 1180 }}>
        <DeleteAccountForm />
      </div>
    </main>
  );
}

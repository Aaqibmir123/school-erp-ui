import SetPasswordForm from "@/src/modules/auth/components/SetPasswordForm";
import { Card } from "antd";
import { Suspense } from "react";

export default function SetPasswordPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card variant="borderless" title="Set Your Password" style={{ width: 400 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <SetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}

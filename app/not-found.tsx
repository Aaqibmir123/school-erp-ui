import { Button, Result } from "antd";
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Result
        status="404"
        title="Page not found"
        subTitle="The route does not exist or was moved."
        extra={
          <Button type="primary">
            <Link href="/">Go to login</Link>
          </Button>
        }
      />
    </main>
  );
}

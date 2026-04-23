import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp, ConfigProvider } from "antd";
import type { Metadata } from "next";

import GlobalLoader from "@/src/components/GlobalLoader";
import ToastBridge from "@/src/components/ToastBridge";
import Providers from "../src/providers";
import { WEB_THEME } from "../src/theme/tokens";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "School ERP",
  description:
    "Production-ready School ERP SaaS for school admins, teachers, students, attendance, exams, fees, and academic operations.",
  title: {
    default: "School ERP Admin",
    template: "%s | School ERP Admin",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <GlobalLoader />
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  borderRadius: WEB_THEME.borderRadius,
                  colorBgBase: WEB_THEME.colors.background,
                  colorBorder: WEB_THEME.colors.border,
                  colorPrimary: WEB_THEME.colors.primary,
                  colorText: WEB_THEME.colors.textPrimary,
                  colorTextSecondary: WEB_THEME.colors.textMuted,
                  fontFamily:
                    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                },
              }}
            >
              <AntdApp>
                <ToastBridge />
                {children}
              </AntdApp>
            </ConfigProvider>
          </AntdRegistry>
        </Providers>
      </body>
    </html>
  );
}

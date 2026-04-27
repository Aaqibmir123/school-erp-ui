"use client";

import { useMemo, useState } from "react";

import {
  BankOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Grid, Layout, Menu } from "antd";
import { useRouter } from "next/navigation";

import { logoutApi } from "@/src/modules/auth/api/auth.api";
import { WEB_THEME } from "@/src/theme/tokens";

const { Sider, Content, Header } = Layout;
const { useBreakpoint } = Grid;

export default function SuperAdminLayout({ children }: any) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(
    () => [
      {
        key: "/super-admin",
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      {
        key: "/super-admin/schools",
        icon: <BankOutlined />,
        label: "Schools",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
      },
    ],
    [],
  );

  const handleMenu = async ({ key }: any) => {
    if (key === "logout") {
      await logoutApi().catch(() => undefined);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      router.push("/");
      setMobileOpen(false);
      return;
    }

    router.push(key);
    setMobileOpen(false);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#F4F7FB" }}>
      {!isMobile && (
        <Sider
          width={280}
          style={{
            background: "linear-gradient(180deg, #0F172A 0%, #111827 100%)",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)",
            height: "100vh",
            overflow: "auto",
            position: "fixed",
          }}
        >
        <div
          style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              padding: 18,
          }}
        >
            <div
              style={{
                alignItems: "center",
                background:
                  "linear-gradient(135deg, rgba(30,64,175,0.55) 0%, rgba(15,23,42,0.98) 100%)",
                border: "1px solid rgba(191,219,254,0.16)",
                borderRadius: 22,
                boxShadow: "0 16px 34px rgba(15, 23, 42, 0.28)",
                display: "flex",
                gap: 14,
                minHeight: 106,
                padding: 16,
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)",
                  borderRadius: 18,
                  color: WEB_THEME.colors.primaryDark,
                  display: "flex",
                  height: 56,
                  justifyContent: "center",
                  width: 56,
                }}
              >
                <ApartmentOutlined />
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>
                  ERP Admin
                </div>
                <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 12 }}>
                  Super admin workspace
                </div>
              </div>
            </div>
          </div>

        <Menu
          theme="dark"
          mode="inline"
          onClick={(e) => {
            void handleMenu(e);
          }}
          items={items}
          style={{
            background: "transparent",
            borderInlineEnd: 0,
            padding: "12px 12px 24px",
          }}
        />
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 280 }}>
        <Header
          style={{
            alignItems: "center",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(248,250,252,0.72) 100%)",
            backdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
            display: "flex",
            height: isMobile ? 72 : 84,
            justifyContent: "space-between",
            padding: isMobile ? "0 14px" : "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: WEB_THEME.colors.textPrimary }} />}
                onClick={() => setMobileOpen(true)}
                style={{ marginInlineStart: -8 }}
              />
            )}
            <div style={{ fontWeight: 800, color: WEB_THEME.colors.textPrimary }}>
              Super Admin Panel
            </div>
          </div>
        </Header>

        {isMobile && (
          <Drawer
            open={mobileOpen}
            placement="left"
            closable={false}
            title={null}
            onClose={() => setMobileOpen(false)}
            size="large"
            styles={{
              body: {
                background: "linear-gradient(180deg, #0F172A 0%, #111827 100%)",
                padding: 0,
              },
            }}
          >
            <Menu
              theme="dark"
              mode="inline"
              items={items}
              onClick={(e) => {
                void handleMenu(e);
              }}
              style={{
                background: "transparent",
                borderInlineEnd: 0,
                padding: "12px 12px 24px",
              }}
            />
          </Drawer>
        )}

        <Content
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
            margin: isMobile ? 12 : 20,
            minHeight: `calc(100vh - ${isMobile ? 64 : 72}px - ${isMobile ? 24 : 40}px)`,
            padding: isMobile ? 14 : 20,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

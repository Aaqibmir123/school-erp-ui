"use client";

import { Avatar, Button, Drawer, Grid, Layout, Menu, Spin } from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useSchool } from "@/src/modules/school-admin/school/useSchool";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function SchoolAdminLayout({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { school, loading } = useSchool();

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [mobileOpen, setMobileOpen] = useState(false);

  /* ================= MENU ITEMS ================= */

  const items: MenuProps["items"] = [
    { key: "/school-admin", icon: <DashboardOutlined />, label: "Dashboard" },

    {
      key: "/school-admin/students",
      icon: <TeamOutlined />,
      label: "Students",
    },
    {
      key: "/school-admin/teachers",
      icon: <UserOutlined />,
      label: "Teachers",
    },

    {
      key: "/school-admin/classes",
      icon: <AppstoreOutlined />,
      label: "Classes",
    },
    {
      key: "/school-admin/sections",
      icon: <ApartmentOutlined />,
      label: "Sections",
    },

    {
      key: "/school-admin/subjects",
      icon: <BookOutlined />,
      label: "Subjects",
    },

    {
      key: "/school-admin/periods",
      icon: <CalendarOutlined />,
      label: "Periods",
    },
    {
      key: "/school-admin/timetable",
      icon: <CalendarOutlined />,
      label: "Timetable",
    },

    {
      key: "/school-admin/exams",
      icon: <BookOutlined />,
      label: "Exams",
    },

    /* 🔥 NEW FEATURE */
    {
      key: "/school-admin/fees",
      icon: <DollarOutlined />,
      label: "Fees",
    },

    { type: "divider" },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  /* ================= NAVIGATION ================= */

  const onClick = ({ key }: any) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      router.push("/");
      return;
    }

    router.push(key);
  };

  /* ================= ACTIVE KEY FIX ================= */

  const getSelectedKey = (): string[] => {
    if (pathname === "/school-admin") return ["/school-admin"];

    const match = items.find((item: any) => pathname.startsWith(item.key));

    return match?.key ? [String(match.key)] : [];
  };

  /* ================= UI ================= */

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ================= SIDEBAR ================= */}
      {!isMobile && (
        <Sider
          width={250}
          style={{
            background: "#001529",
            position: "fixed",
            height: "100vh",
          }}
        >
          <div
            style={{
              color: "#fff",
              padding: 20,
              fontWeight: 600,
              fontSize: 16,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            School Admin
          </div>

          <Menu
            theme="dark"
            mode="inline"
            items={items}
            selectedKeys={getSelectedKey()}
            onClick={onClick}
          />
        </Sider>
      )}

      {/* ================= MAIN ================= */}
      <Layout style={{ marginLeft: isMobile ? 0 : 250 }}>
        {/* ================= HEADER ================= */}
        <Header
          style={{
            background: "linear-gradient(90deg, #1677ff, #4096ff)",
            padding: isMobile ? "0 12px" : "0 20px",
            height: isMobile ? 60 : 70,
            display: "flex",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: "#fff" }} />}
                onClick={() => setMobileOpen(true)}
              />
            )}

            {loading ? (
              <Spin />
            ) : school ? (
              <>
                <Avatar size={isMobile ? 32 : 40} src={school.logo}>
                  {!school.logo && school.name?.charAt(0)}
                </Avatar>

                <div style={{ color: "#fff" }}>
                  <div style={{ fontWeight: 600 }}>{school.name}</div>

                  {!isMobile && (
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {school.address}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <span style={{ color: "#fff" }}>No School</span>
            )}
          </div>
        </Header>

        {/* ================= MOBILE ================= */}
        {isMobile && (
          <Drawer
            open={mobileOpen}
            placement="left"
            closable={false}
            title={null}
            onClose={() => setMobileOpen(false)}
            styles={{
              body: { padding: 0, background: "#001529" },
            }}
          >
            <Menu
              theme="dark"
              mode="inline"
              items={items}
              selectedKeys={getSelectedKey()}
              onClick={(e) => {
                onClick(e);
                setMobileOpen(false);
              }}
            />
          </Drawer>
        )}

        {/* ================= CONTENT ================= */}
        <Content
          style={{
            margin: isMobile ? 10 : 16,
            padding: isMobile ? 12 : 16,
            background: "#fff",
            borderRadius: 12,
            minHeight: "calc(100vh - 70px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

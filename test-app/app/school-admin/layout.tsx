"use client";

import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  CarOutlined,
  CarryOutOutlined,
  DashboardOutlined,
  DollarOutlined,
  BankOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  MenuOutlined,
  ProfileOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  Button,
  Drawer,
  Grid,
  Layout,
  Menu,
  Typography,
} from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useSchool } from "@/src/modules/school-admin/school/useSchool";
import BrandLoader from "@/src/components/BrandLoader";
import { logoutApi } from "@/src/modules/auth/api/auth.api";
import { WEB_THEME } from "@/src/theme/tokens";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const buildMenuItems = (): MenuProps["items"] => [
  { key: "/school-admin", icon: <DashboardOutlined />, label: "Dashboard" },
  {
    key: "/school-admin/attendance",
    icon: <CarryOutOutlined />,
    label: "Attendance",
  },
  {
    key: "people",
    icon: <TeamOutlined />,
    label: "People",
    children: [
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
    ],
  },
  {
    key: "academic",
    icon: <BookOutlined />,
    label: "Academic",
    children: [
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
        icon: <ProfileOutlined />,
        label: "Periods",
      },
      {
        key: "/school-admin/timetable",
        icon: <EnvironmentOutlined />,
        label: "Timetable",
      },
      {
        key: "/school-admin/exams",
        icon: <CarryOutOutlined />,
        label: "Exams",
      },
    ],
  },
  {
    key: "finance",
    icon: <DollarOutlined />,
    label: "Finance",
    children: [
      {
        key: "/school-admin/fees",
        icon: <DollarOutlined />,
        label: "Fees",
      },
    ],
  },
  {
    key: "operations",
    icon: <CarOutlined />,
    label: "Operations",
    children: [
      {
        key: "/school-admin/transport",
        icon: <CarOutlined />,
        label: "Transport",
      },
    ],
  },
  {
    key: "school",
    icon: <BankOutlined />,
    label: "School",
    children: [
      {
        key: "/school-admin/school",
        icon: <BankOutlined />,
        label: "School Profile",
      },
      {
        key: "/school-admin/settings",
        icon: <ClockCircleOutlined />,
        label: "Time Management",
      },
      {
        key: "/school-admin/academic-year",
        icon: <ProfileOutlined />,
        label: "Academic Year",
      },
    ],
  },
  { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
];

const getParentGroup = (pathname: string) => {
  if (
    pathname.startsWith("/school-admin/students") ||
    pathname.startsWith("/school-admin/teachers")
  ) {
    return "people";
  }
  if (pathname.startsWith("/school-admin/attendance")) {
    return undefined;
  }
  if (
    pathname.startsWith("/school-admin/classes") ||
    pathname.startsWith("/school-admin/sections") ||
    pathname.startsWith("/school-admin/subjects") ||
    pathname.startsWith("/school-admin/periods") ||
    pathname.startsWith("/school-admin/timetable") ||
    pathname.startsWith("/school-admin/exams")
  ) {
    return "academic";
  }
  if (pathname.startsWith("/school-admin/fees")) return "finance";
  if (pathname.startsWith("/school-admin/transport")) return "operations";
  if (
    pathname.startsWith("/school-admin/school") ||
    pathname.startsWith("/school-admin/settings") ||
    pathname.startsWith("/school-admin/academic-year")
  ) {
    return "school";
  }
  return undefined;
};

const getSelectedKey = (items: MenuProps["items"], pathname: string) => {
  const flattened: string[] = [];

  const walk = (menuItems: MenuProps["items"]) => {
    menuItems?.forEach((item) => {
      if (!item || typeof item === "string") return;

      if ("children" in item && item.children) {
        walk(item.children);
        return;
      }

      if ("key" in item && item.key) {
        flattened.push(String(item.key));
      }
    });
  };

  walk(items);

  const exact = flattened.find((key) => key === pathname);
  if (exact) return [exact];

  const longest = flattened
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  return longest ? [longest] : ["/school-admin"];
};

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { school, loading } = useSchool(pathname);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const schoolName = school?.name || school?.schoolName || "School Admin";
  const schoolAddress = school?.address || "School ERP admin workspace";

  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useMemo(() => buildMenuItems(), []);
  const selectedKeys = useMemo(
    () => getSelectedKey(items, pathname),
    [items, pathname],
  );
  const defaultOpenKeys = useMemo(() => {
    const group = getParentGroup(pathname);
    return group ? [group] : [];
  }, [pathname]);

  const handleNavigate = async ({ key }: { key: string }) => {
    if (key === "logout") {
      await logoutApi().catch(() => undefined);
      localStorage.removeItem("token");
      router.push("/");
      setMobileOpen(false);
      return;
    }

    router.push(key);
    setMobileOpen(false);
  };

  const menu = (
    <Menu
      key={pathname}
      theme="dark"
      mode="inline"
      items={items}
      selectedKeys={selectedKeys}
      defaultOpenKeys={defaultOpenKeys}
      onClick={(e) => {
        void handleNavigate({ key: e.key });
      }}
      style={{
        background: "transparent",
        borderInlineEnd: 0,
        padding: "12px 12px 24px",
      }}
    />
  );

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
              <Avatar
                src={school?.logo}
                size={58}
                style={{
                  background:
                    "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)",
                  border: "1px solid rgba(191,219,254,0.36)",
                  flexShrink: 0,
                }}
              >
                {!school?.logo && schoolName.charAt(0)}
              </Avatar>
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {schoolName}
                </div>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    display: "block",
                    fontSize: 12,
                    lineHeight: 1.4,
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {schoolAddress}
                </Text>
              </div>
            </div>
          </div>

          {menu}
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
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: 1,
              gap: isMobile ? 10 : 12,
              minWidth: 0,
              paddingLeft: isMobile ? 0 : 4,
            }}
          >
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: WEB_THEME.colors.textPrimary }} />}
                onClick={() => setMobileOpen(true)}
                style={{ marginInlineStart: -8 }}
              />
            )}

            {loading ? (
              <BrandLoader compact />
            ) : school ? (
              <>
                <Avatar
                  size={isMobile ? 34 : 40}
                  src={school.logo}
                  style={{
                    background:
                      "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)",
                    color: WEB_THEME.colors.primaryDark,
                    border: "1px solid rgba(29, 78, 216, 0.12)",
                    flexShrink: 0,
                  }}
                >
                  {!school.logo && schoolName.charAt(0)}
                </Avatar>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: WEB_THEME.colors.textPrimary,
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {schoolName}
                  </div>
                  <div
                    style={{
                      color: WEB_THEME.colors.textMuted,
                      fontSize: isMobile ? 11 : 12,
                      lineHeight: 1.2,
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {schoolAddress}
                  </div>
                </div>
              </>
            ) : (
              <span style={{ color: WEB_THEME.colors.textMuted }}>
                School profile not set
              </span>
            )}
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
            {menu}
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

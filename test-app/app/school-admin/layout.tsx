"use client";

import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  BookOutlined,
  CarOutlined,
  CarryOutOutlined,
  DashboardOutlined,
  DollarOutlined,
  BankOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  MenuOutlined,
  NotificationOutlined,
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
  Layout,
  Menu,
  Typography,
} from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useSchool } from "@/src/modules/school-admin/school/useSchool";
import {
  useGetProfileQuery,
  useLogoutMutation,
} from "@/src/modules/auth/api/auth.api";
import { WEB_THEME } from "@/src/theme/tokens";

const { Header, Sider, Content } = Layout;
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
      {
        key: "/school-admin/results",
        icon: <ProfileOutlined />,
        label: "Results",
      },
      {
        key: "/school-admin/marks-cards",
        icon: <FileDoneOutlined />,
        label: "Marks Cards",
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
      {
        key: "/school-admin/notices",
        icon: <NotificationOutlined />,
        label: "Notices",
      },
    ],
  },
  {
    key: "/school-admin/reports",
    icon: <BarChartOutlined />,
    label: "Reports",
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
    pathname.startsWith("/school-admin/exams") ||
    pathname.startsWith("/school-admin/results") ||
    pathname.startsWith("/school-admin/marks-cards")
  ) {
    return "academic";
  }
  if (pathname.startsWith("/school-admin/fees")) return "finance";
  if (pathname.startsWith("/school-admin/transport")) return "operations";
  if (
    pathname.startsWith("/school-admin/school") ||
    pathname.startsWith("/school-admin/settings") ||
    pathname.startsWith("/school-admin/academic-year") ||
    pathname.startsWith("/school-admin/notices")
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
  const [hasToken, setHasToken] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sessionQuery = useGetProfileQuery(undefined, { skip: !hasToken });
  const { school } = useSchool(pathname);
  const [logout] = useLogoutMutation();
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

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));

    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const handleNavigate = async ({ key }: { key: string }) => {
    if (key === "logout") {
      await logout().unwrap().catch(() => undefined);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
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

  useEffect(() => {
    if (!hasToken || !sessionQuery.isError) return;

    localStorage.removeItem("token");
    router.replace("/");
  }, [hasToken, router, sessionQuery.isError]);

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
                src={school?.logo || undefined}
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
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(242,246,255,0.78) 100%)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
            display: "flex",
            height: isMobile ? 68 : 76,
            justifyContent: "space-between",
            padding: isMobile ? "0 12px" : "0 20px",
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

            <>
              <Avatar
                size={isMobile ? 32 : 38}
                src={school?.logo || undefined}
                style={{
                  background:
                    "linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)",
                  color: WEB_THEME.colors.primaryDark,
                  border: "1px solid rgba(29, 78, 216, 0.12)",
                  flexShrink: 0,
                }}
              >
                {(!school?.logo && schoolName.charAt(0)) || "S"}
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
                    fontSize: isMobile ? 14 : 15,
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
                    fontSize: isMobile ? 10 : 11,
                    lineHeight: 1.15,
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
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
            borderRadius: 24,
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
            margin: isMobile ? 10 : 18,
            minHeight: `calc(100vh - ${isMobile ? 60 : 68}px - ${isMobile ? 20 : 36}px)`,
            padding: isMobile ? 14 : 18,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

"use client";

import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Sider, Content, Header } = Layout;

export default function SuperAdminLayout({ children }: any) {
  const router = useRouter();

  const handleMenu = ({ key }: any) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    router.push(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div
          style={{
            color: "white",
            padding: 20,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          ERP Admin
        </div>

        <Menu
          theme="dark"
          mode="inline"
          onClick={handleMenu}
          items={[
            {
              key: "/super-admin",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/super-admin/schools",
              icon: <BankOutlined />,
              label: "New School Requests",
            },
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Logout",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff" }}>Super Admin Panel</Header>

        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}

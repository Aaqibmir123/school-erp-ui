import { Tag } from "antd";

export const FeeStatusTag = ({ status }: { status: string }) => {
  const map: any = {
    paid: "green",
    partial: "orange",
    unpaid: "red",
  };

  return <Tag color={map[status] || "default"}>{status.toUpperCase()}</Tag>;
};

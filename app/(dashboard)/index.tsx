import { IconProps } from "@/components/Icon";
import React from "react";
import NewDashboard from "../../components/new-dashboard";

export type IDashboardOption = {
  icon: IconProps["name"];
  label: string;
  action: () => void;
  longAction?: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
  color?: string;
  isNew?: boolean;
};

const MyDashboard = () => {
  return <NewDashboard />;
};

export default MyDashboard;

"use client";

import { useSearchParams } from "next/navigation";
import DashboardPage from "@/components/DashboardPage";

export default function DashboardClient() {
  const sp = useSearchParams();
  const userName = sp.get("user") ?? "User";
  return <DashboardPage userName={userName} />;
}

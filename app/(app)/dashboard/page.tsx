import DashboardClient from "./DashboardClient";

export const dynamic = "force-static";
export const revalidate = false;

export default function Page() {
  return <DashboardClient />;
}

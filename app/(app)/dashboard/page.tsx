import DashboardPage from "@/components/DashboardPage";

export default function Page({
  searchParams,
}: {
  searchParams?: { user?: string | string[] };
}) {
  const userName =
    typeof searchParams?.user === "string" ? searchParams.user : "User";

  // No custom hooks passed through the server boundary; the client component
  // will use its default shims unless you inject hooks in tests.
  return <DashboardPage userName={userName} />;
}

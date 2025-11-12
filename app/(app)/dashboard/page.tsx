import DashboardPage from "@/components/DashboardPage";

// In Next 15, `searchParams` may be a Promise when PPR is enabled.
// Type it to accept either a value or a Promise.
type SearchParams =
  | Record<string, string | string[]>
  | Promise<Record<string, string | string[]>>;

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : undefined;

  const userName =
    typeof (sp as Record<string, string | string[] | undefined>)?.user === "string"
      ? (sp as Record<string, string>)!.user
      : "User";

  return <DashboardPage userName={userName} />;
}

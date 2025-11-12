import DashboardPage from "@/components/DashboardPage";

// Next 15 may supply `searchParams` as a Promise (PPR).
type SPromise = Promise<Record<string, string | string[]>>;

export default async function Page({
  searchParams,
}: {
  // Match Next's constraint: Promise | undefined
  searchParams?: SPromise;
}) {
  // `await` works even if it's a plain object at runtime
  const sp = (await searchParams) as
    | Record<string, string | string[]>
    | undefined;

  const userName =
    typeof sp?.user === "string" ? sp.user : "User";

  return <DashboardPage userName={userName} />;
}

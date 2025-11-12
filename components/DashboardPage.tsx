"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Award,
  ChevronRight,
  Dumbbell,
  Eye,
  Flame,
  Play,
  Timer,
} from "lucide-react";
import UserDropdown from "@/components/UserDropdown";
import DailyCheckIn from "@/components/DailyCheckIn";

/* -------------------------------
   Brand / layout tokens
-------------------------------- */
const UI = {
  page:
    "min-h-screen bg-gradient-to-b from-[#0b1735] via-[#0e1d41] to-[#001130] text-white/90",
  shell:
    "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 lg:pt-18 pb-20",
  card:
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-sm",
  cardHover: "transition-shadow hover:shadow-md focus-visible:shadow-md",
  kpiLabel:
    "text-[11px] md:text-xs uppercase tracking-wide text-white/60 select-none",
};

/* -------------------------------
   Types for hooks
-------------------------------- */
export type KPIMetrics = {
  streakDays: number;
  exercises: number;
  achievements: number;
  totalMinutes: number;
  wellnessScore?: number | null;
};

export type ActivityItem = {
  id: string;
  type: "exercise" | "test" | "blog";
  title: string;
  time: string;
  duration?: string;
};

export type DashboardDataHooks = {
  useMetrics: () => {
    data?: KPIMetrics;
    isLoading: boolean;
    isError?: boolean;
    refetch?: () => void;
  };
  useRecent: () => {
    data?: ActivityItem[];
    isLoading: boolean;
    isError?: boolean;
    refetch?: () => void;
  };
};

/* -------------------------------
   Utilities
-------------------------------- */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/10 ${className}`}
      aria-hidden="true"
    />
  );
}

/* -------------------------------
   Welcome (sits on page gradient)
-------------------------------- */
function WelcomePanel({ userName = "User" }: { userName?: string }) {
  return (
    <section aria-label="Welcome">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-[Manrope] text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Welcome, {userName}
          </h1>
          <p className="mt-1 text-sm md:text-base text-white/80">
            Keep your eyes healthy
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/exercises"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6592E1] to-[#81B1E6] px-3 py-2 md:px-4 md:py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(101,146,225,0.35)] outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            aria-label="Start Exercise"
          >
            <span
              className="inline-grid h-6 w-6 place-items-center rounded-lg bg-white/15"
              aria-hidden="true"
            >
              <Play className="h-4 w-4" />
            </span>
            <span>Start Exercise</span>
            <ChevronRight
              className="ml-0.5 h-4 w-4 opacity-90 group-hover:translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
          </Link>

          <UserDropdown />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------
   KPI strip (numbers only)
-------------------------------- */
function KPIBox({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <div
      className={`${UI.card} ${UI.cardHover} p-3.5 md:p-4`}
      role="group"
      aria-label={`${label} ${value}`}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <span
            className={`inline-grid h-10 w-10 place-items-center rounded-full bg-white/10 ${iconClassName ?? ""}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <div>
          <p className={UI.kpiLabel}>{label}</p>
          <p className="font-[Manrope] text-xl md:text-2xl font-bold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function KPIStrip({
  data,
  isLoading,
}: {
  data?: KPIMetrics;
  isLoading: boolean;
}) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Skeleton className="h-18 md:h-20" />
        <Skeleton className="h-18 md:h-20" />
        <Skeleton className="h-18 md:h-20" />
        <Skeleton className="h-18 md:h-20" />
        <Skeleton className="h-18 md:h-20" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KPIBox
        label="Current Streak"
        value={`${data.streakDays}d`}
        icon={<Flame className="h-5 w-5" />}
        iconClassName="text-amber-300 ring-2 ring-amber-300/50 shadow-[0_0_0_3px_rgba(251,191,36,0.25),0_0_18px_rgba(251,191,36,0.45)]"
      />
      <KPIBox
        label="Exercises"
        value={data.exercises}
        icon={<Dumbbell className="h-5 w-5" />}
      />
      <KPIBox
        label="Achievements"
        value={data.achievements}
        icon={<Award className="h-5 w-5" />}
      />
      <KPIBox
        label="Total Time"
        value={`${data.totalMinutes}m`}
        icon={<Timer className="h-5 w-5" />}
      />
      <KPIBox
        label="Wellness"
        value={data.wellnessScore ?? "–"}
        icon={<Eye className="h-5 w-5" />}
      />
    </div>
  );
}

/* -------------------------------
   Quick Start
-------------------------------- */
function QuickLink({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${UI.card} ${UI.cardHover} group flex items-center justify-between gap-4 p-4 outline-none focus-visible:ring-4 focus-visible:ring-white/20`}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-grid h-10 w-10 place-items-center rounded-full bg-white/10"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div>
          <p className="font-[Manrope] font-semibold text-white">{title}</p>
          <p className="text-sm text-white/70">{desc}</p>
        </div>
      </div>
      <ChevronRight
        className="h-5 w-5 opacity-70 group-hover:translate-x-0.5 transition-transform"
        aria-hidden="true"
      />
    </Link>
  );
}

function QuickStart() {
  return (
    <section className={`${UI.card} p-4`} aria-labelledby="quickstart-title">
      <h2
        id="quickstart-title"
        className="font-[Manrope] text-xl md:text-2xl font-semibold text-white"
      >
        Quick Start
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink
          href="/exercises"
          title="Start an Exercise"
          desc="Short guided sessions"
          icon={<Dumbbell className="h-5 w-5" />}
        />
        <QuickLink
          href="/tests"
          title="Take a Test"
          desc="Check your vision metrics"
          icon={<Activity className="h-5 w-5" />}
        />
        <QuickLink
          href="/blog"
          title="Read a Blog"
          desc="Tips and tutorials"
          icon={<Award className="h-5 w-5" />}
        />
      </div>
    </section>
  );
}

/* -------------------------------
   Recent Activity
-------------------------------- */
function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "exercise") return <Dumbbell className="h-4 w-4" aria-hidden="true" />;
  if (type === "test") return <Activity className="h-4 w-4" aria-hidden="true" />;
  return <Award className="h-4 w-4" aria-hidden="true" />;
}

function RecentActivity({
  items,
  isLoading,
  isError,
  onRetry,
  fullHeight = false,
}: {
  items?: ActivityItem[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  fullHeight?: boolean;
}) {
  return (
    <section
      className={`${UI.card} p-4 ${fullHeight ? "h-full min-h-[340px] flex flex-col" : ""}`}
      aria-labelledby="recent-title"
    >
      <h2
        id="recent-title"
        className="font-[Manrope] text-xl md:text-2xl font-semibold text-white"
      >
        Recent Activity
      </h2>

      {isLoading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : isError ? (
        <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3">
          <p className="text-sm">Couldn’t load activity.</p>
          {onRetry ? (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : items && items.length ? (
        <ul className="mt-3 divide-y divide-white/10">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="inline-grid h-8 w-8 place-items-center rounded-lg bg-white/10"
                  aria-hidden="true"
                >
                  <ActivityIcon type={it.type} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{it.title}</p>
                  <p className="text-xs text-white/65">
                    {it.time}
                    {it.duration ? ` • ${it.duration}` : ""}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-white/12 p-5 text-sm text-white/75">
          No recent activity yet. Start your first exercise to see updates here.
          <div className="mt-3">
            <Link
              href="/exercises"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start Exercise
            </Link>
          </div>
        </div>
      )}
      {fullHeight ? <div className="mt-auto" /> : null}
    </section>
  );
}

/* -------------------------------
   Shims so the page renders now
-------------------------------- */
function useMetricsShim() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KPIMetrics>();
  useEffect(() => {
    const t = setTimeout(() => {
      setData({
        streakDays: 3,
        exercises: 12,
        achievements: 4,
        totalMinutes: 86,
        wellnessScore: 82,
      });
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, []);
  return { data, isLoading: loading, isError: false as const, refetch: () => {} };
}
function useRecentShim() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActivityItem[]>();
  useEffect(() => {
    const t = setTimeout(() => {
      setData([
        { id: "1", type: "exercise", title: "Blink Routine", time: "Today, 10:12 AM", duration: "3m" },
        { id: "2", type: "test", title: "Contrast Sensitivity", time: "Yesterday, 6:40 PM", duration: "4m" },
      ]);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, []);
  return { data, isLoading: loading, isError: false as const, refetch: () => {} };
}

/* -------------------------------
   Client component
-------------------------------- */
export default function DashboardPage({
  userName = "User",
  hooks,
}: {
  userName?: string;
  hooks?: DashboardDataHooks;
}) {
  const appliedHooks: DashboardDataHooks = hooks ?? {
    useMetrics: useMetricsShim,
    useRecent: useRecentShim,
  };

  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics,
  } = appliedHooks.useMetrics();

  const {
    data: recent,
    isLoading: recentLoading,
    isError: recentError,
    refetch: refetchRecent,
  } = appliedHooks.useRecent();

  return (
    <main className={UI.page}>
      <div className={UI.shell}>
        <WelcomePanel userName={userName} />

        <section className="pt-4" aria-label="Key performance indicators">
          {metricsError ? (
            <div className={`${UI.card} p-3.5`}>
              <p className="text-sm">Couldn’t load metrics.</p>
              <button
                onClick={refetchMetrics}
                className="mt-2 inline-flex items-center rounded-lg bg-white/10 px-3 py-1.5 text-sm outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Retry
              </button>
            </div>
          ) : (
            <KPIStrip data={metrics} isLoading={metricsLoading} />
          )}
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
          <section className="lg:col-span-2 self-stretch">
            <div className={`${UI.card} p-4 h-full`} aria-labelledby="checkin-title">
              <h2
                id="checkin-title"
                className="font-[Manrope] text-xl md:text-2xl font-semibold text-white"
              >
                How are your eyes feeling today?
              </h2>
              <div className="mt-3">
                <DailyCheckIn />
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1 self-stretch">
            <RecentActivity
              items={recent}
              isLoading={recentLoading}
              isError={recentError}
              onRetry={refetchRecent}
              fullHeight
            />
          </aside>
        </div>

        <div className="mt-4">
          <QuickStart />
        </div>
      </div>
    </main>
  );
}

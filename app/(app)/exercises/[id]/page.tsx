// app/(app)/exercises/[id]/page.tsx
import { notFound } from "next/navigation";
import { exercises } from "@/app/api/exercises/route";
import ExerciseDetailClient from "../ExerciseDetailClient";

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  return exercises.map((e) => ({ id: e.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 👈 v15: params can be a Promise
  const ex = exercises.find((e) => e.id === id);
  if (!ex) notFound();
  return <ExerciseDetailClient ex={ex} />;
}

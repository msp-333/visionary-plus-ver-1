import { notFound } from "next/navigation";
import { exercises } from "@/lib/exercises";
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
  const { id } = await params; // Next 15: params can be a Promise
  const ex = exercises.find((e) => e.id === id);
  if (!ex) notFound();
  return <ExerciseDetailClient ex={ex} />;
}

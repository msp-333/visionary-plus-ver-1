import { notFound } from "next/navigation";
import { exercises } from "@/app/api/exercises/route";
import ExerciseDetailClient from "../ExerciseDetailClient";

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  return exercises.map(e => ({ id: e.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const ex = exercises.find(e => e.id === params.id);
  if (!ex) notFound();
  return <ExerciseDetailClient ex={ex} />;
}

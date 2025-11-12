import { exercises } from "@/lib/exercises";

export const dynamic = "force-static"; // ok for output: "export"

export async function GET() {
  return Response.json(exercises);
}

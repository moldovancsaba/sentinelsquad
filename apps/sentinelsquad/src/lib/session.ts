import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ensureSentinelSquadBootstrap } from "@/lib/bootstrap";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  await ensureSentinelSquadBootstrap();
  return session;
}

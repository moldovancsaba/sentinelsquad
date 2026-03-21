import { getAppSession } from "@/lib/app-session";
import { ensureSovereignBootstrap } from "@/lib/bootstrap";

export async function requireSession() {
  const session = await getAppSession();
  if (!session?.user) {
    return null;
  }
  await ensureSovereignBootstrap();
  return session;
}

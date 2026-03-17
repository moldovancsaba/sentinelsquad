import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { requireSession } from "@/lib/session";
import { getIdeWorkspaceRoot, listIdeTree } from "@/lib/ide";
import { IdeClient } from "@/app/ide/IdeClient";
import { prisma } from "@/lib/prisma";
import { getIdeUnsafeModeInfo } from "@/lib/ide";

export default async function IdePage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  const workspaceRoot = getIdeWorkspaceRoot();
  const [initial, agents, unsafeModeInfo] = await Promise.all([
    listIdeTree(""),
    prisma.agent.findMany({
      where: { enabled: true, runtime: { not: "MANUAL" } },
      select: { key: true, runtime: true, controlRole: true },
      orderBy: { key: "asc" }
    }),
    getIdeUnsafeModeInfo()
  ]);

  return (
    <Shell
      title="IDE"
      subtitle="In-app file explorer, editor, and command runner"
    >
      <IdeClient
        workspaceRoot={workspaceRoot}
        initialBase={initial.base}
        initialNodes={initial.nodes}
        initialCommandPolicy={initial.commandPolicy}
        unsafeModeInfo={unsafeModeInfo}
        agents={agents.map((a) => ({
          key: a.key,
          runtime: a.runtime,
          controlRole: a.controlRole
        }))}
      />
    </Shell>
  );
}

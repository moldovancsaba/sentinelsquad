"use server";

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createMessage, getOrCreateThread } from "@/lib/chat";
import { enqueueTask } from "@/lib/tasks";
import { resolveUnifiedChatControllerAgent } from "@/lib/active-agents";
import {
  getChatDevPath,
  getNexusRoleMapping,
  getNexusSeminarWorkflowPath,
  readNexusRunArtifact,
  writeNexusRunArtifact
} from "@/lib/nexus-control";

const execAsync = promisify(exec);

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Not authenticated.");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEmail = ((session.user as any).email as string | undefined) ?? null;
  return { userId: userId ?? null, userEmail };
}

async function resolveControllerAgentKey() {
  const mapping = getNexusRoleMapping();
  const resolved = await resolveUnifiedChatControllerAgent(mapping.controllerKey);
  return {
    key: resolved.agent?.key || null,
    fallback: resolved.fallback,
    requested: mapping.controllerKey
  };
}

export async function runNexusSeminarAction() {
  await requireUser();

  const chatDevPath = getChatDevPath();
  const workflowPath = getNexusSeminarWorkflowPath();
  const prompt = "@Controller initialize the Nexus-OS environment and run a baseline benchmark on the team.";

  const command = [
    `cd \"${chatDevPath}\"`,
    `source .venv/bin/activate`,
    `printf '%s\\n' \"${prompt.replace(/\"/g, "'")}\" | BASE_URL='http://127.0.0.1:11434/v1' API_KEY='ollama-local' python run.py --path \"${workflowPath}\" --name NexusControllerSeminar`
  ].join(" && ");

  try {
    const { stdout, stderr } = await execAsync(`bash -lc ${JSON.stringify(command)}`, {
      timeout: 180_000,
      maxBuffer: 1024 * 1024
    });
    const output = `${stdout || ""}${stderr || ""}`.trim().slice(0, 30000);
    await writeNexusRunArtifact({
      timestamp: new Date().toISOString(),
      ok: true,
      command,
      workflowPath,
      output
    });
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = `${err.stdout || ""}\n${err.stderr || ""}\n${err.message || ""}`
      .trim()
      .slice(0, 30000);
    await writeNexusRunArtifact({
      timestamp: new Date().toISOString(),
      ok: false,
      command,
      workflowPath,
      output
    });
    throw new Error("ChatDev seminar execution failed. Check last run output on /nexus.");
  }

  revalidatePath("/nexus");
}

export async function syncNexusSeminarToSentinelSquadAction() {
  const { userId, userEmail } = await requireUser();

  const last = await readNexusRunArtifact();
  if (!last) throw new Error("No seminar run artifact found.");

  const controller = await resolveControllerAgentKey();
  if (!controller.key) {
    throw new Error("No active controller or ALPHA fallback agent is available for unified execution.");
  }

  const thread = await getOrCreateThread({
    kind: "GLOBAL",
    ref: "main",
    title: "Global",
    createdById: userId
  });

  const summary = [
    `Nexus seminar sync (${last.ok ? "PASS" : "FAIL"})`,
    `timestamp=${last.timestamp}`,
    `workflow=${last.workflowPath}`,
    "output:",
    last.output.slice(0, 4000)
  ].join("\n");

  await createMessage({
    threadId: thread.id,
    userId,
    authorType: "SYSTEM",
    content: summary,
    meta: {
      kind: "nexus_seminar_sync",
      success: last.ok,
      fallbackController: controller.fallback,
      requestedControllerKey: controller.requested
    }
  });

  const task = await enqueueTask({
    agentKey: controller.key,
    title: "Nexus seminar follow-up: validate and report",
    threadId: thread.id,
    createdById: userId,
    createdByEmail: userEmail,
    payload: {
      kind: "nexus_seminar_sync_task",
      seminarSuccess: last.ok,
      seminarTimestamp: last.timestamp,
      seminarOutput: last.output.slice(0, 12000)
    }
  });

  await createMessage({
    threadId: thread.id,
    authorType: "SYSTEM",
    content: `Nexus seminar follow-up queued for @${controller.key} (task ${task.id}).`,
    meta: {
      kind: "nexus_seminar_followup_enqueued",
      taskId: task.id,
      agentKey: controller.key
    }
  });

  revalidatePath("/chat");
  revalidatePath("/nexus");
}

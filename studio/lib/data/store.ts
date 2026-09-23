import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import type { FileTree, TemplateId } from "@/lib/types";
import {
  localAddMessage,
  localAddVersion,
  localCreateProject,
  localGetProject,
  localLatestVersion,
  localListMessages,
  localListProjects,
  localRenameProject,
  localSpendCredits,
} from "@/lib/data/local-store";
import {
  sbAddMessage,
  sbAddVersion,
  sbCreateProject,
  sbGetProject,
  sbLatestVersion,
  sbListMessages,
  sbListProjects,
  sbRenameProject,
  sbSpendCredits,
} from "@/lib/data/supabase-store";

async function client() {
  const supabase = await createServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function listProjects(userId: string) {
  if (!isSupabaseConfigured()) return localListProjects(userId);
  return sbListProjects(await client(), userId);
}

export async function getProject(userId: string, projectId: string) {
  if (!isSupabaseConfigured()) return localGetProject(userId, projectId);
  return sbGetProject(await client(), userId, projectId);
}

export async function createProject(input: {
  userId: string;
  name: string;
  templateId: TemplateId;
  files: FileTree;
}) {
  if (!isSupabaseConfigured()) return localCreateProject(input);
  return sbCreateProject(await client(), input);
}

export async function renameProject(userId: string, projectId: string, name: string) {
  if (!isSupabaseConfigured()) return localRenameProject(userId, projectId, name);
  return sbRenameProject(await client(), userId, projectId, name);
}

export async function latestVersion(projectId: string) {
  if (!isSupabaseConfigured()) return localLatestVersion(projectId);
  return sbLatestVersion(await client(), projectId);
}

export async function addVersion(input: {
  projectId: string;
  files: FileTree;
  prompt: string;
}) {
  if (!isSupabaseConfigured()) return localAddVersion(input);
  return sbAddVersion(await client(), input);
}

export async function listMessages(projectId: string) {
  if (!isSupabaseConfigured()) return localListMessages(projectId);
  return sbListMessages(await client(), projectId);
}

export async function addMessage(input: {
  projectId: string;
  role: "user" | "assistant";
  content: string;
  creditsUsed?: number;
}) {
  if (!isSupabaseConfigured()) return localAddMessage(input);
  return sbAddMessage(await client(), input);
}

export async function spendCredits(
  userId: string,
  amount: number,
  reason: string,
  refId?: string,
) {
  if (!isSupabaseConfigured()) {
    return localSpendCredits(userId, amount, reason, refId);
  }
  return sbSpendCredits(await client(), amount, reason, refId);
}

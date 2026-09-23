import type { SupabaseClient } from "@supabase/supabase-js";
import type { FileTree, Message, Project, TemplateId } from "@/lib/types";
import { TRIAL_CREDITS } from "@/lib/env";

type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    templateId: row.template_id as TemplateId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function sbEnsureProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string,
) {
  await supabase.from("profiles").upsert({ id: userId, email });
  const { data } = await supabase
    .from("credit_ledger")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", "trial_grant")
    .limit(1);
  if (!data?.length) {
    await supabase.from("credit_ledger").insert({
      user_id: userId,
      delta: TRIAL_CREDITS,
      reason: "trial_grant",
    });
  }
}

export async function sbListProjects(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ProjectRow[]).map(mapProject);
}

export async function sbGetProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProject(data as ProjectRow) : null;
}

export async function sbCreateProject(
  supabase: SupabaseClient,
  input: { userId: string; name: string; templateId: TemplateId; files: FileTree },
) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: input.userId,
      name: input.name,
      template_id: input.templateId,
    })
    .select("*")
    .single();
  if (error) throw error;
  const project = mapProject(data as ProjectRow);
  const version = await supabase.from("project_versions").insert({
    project_id: project.id,
    files: input.files,
    prompt: null,
  });
  if (version.error) throw version.error;
  return project;
}

export async function sbRenameProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  name: string,
) {
  const { data, error } = await supabase
    .from("projects")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? mapProject(data as ProjectRow) : null;
}

export async function sbLatestVersion(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("project_versions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    files: (data.files ?? {}) as FileTree,
    prompt: (data.prompt as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

export async function sbAddVersion(
  supabase: SupabaseClient,
  input: { projectId: string; files: FileTree; prompt: string },
) {
  const { data, error } = await supabase
    .from("project_versions")
    .insert({
      project_id: input.projectId,
      files: input.files,
      prompt: input.prompt,
    })
    .select("*")
    .single();
  if (error) throw error;
  await supabase
    .from("projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.projectId);
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    files: (data.files ?? {}) as FileTree,
    prompt: (data.prompt as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

export async function sbListMessages(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    projectId: row.project_id as string,
    role: row.role as Message["role"],
    content: row.content as string,
    creditsUsed: row.credits_used as number,
    createdAt: row.created_at as string,
  }));
}

export async function sbAddMessage(
  supabase: SupabaseClient,
  input: {
    projectId: string;
    role: "user" | "assistant";
    content: string;
    creditsUsed?: number;
  },
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      project_id: input.projectId,
      role: input.role,
      content: input.content,
      credits_used: input.creditsUsed ?? 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    projectId: data.project_id as string,
    role: data.role as Message["role"],
    content: data.content as string,
    creditsUsed: data.credits_used as number,
    createdAt: data.created_at as string,
  };
}

export async function sbBalance(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.rpc("credit_balance", { uid: userId });
  if (error) {
    const { data: rows } = await supabase
      .from("credit_ledger")
      .select("delta")
      .eq("user_id", userId);
    return (rows ?? []).reduce((sum, row) => sum + (row.delta as number), 0);
  }
  return Number(data ?? 0);
}

export async function sbSpendCredits(
  supabase: SupabaseClient,
  amount: number,
  reason: string,
  refId?: string,
) {
  const { data, error } = await supabase.rpc("spend_credits", {
    p_amount: amount,
    p_reason: reason,
    p_ref: refId ?? null,
  });
  if (error) {
    const err = new Error(error.message.includes("insufficient") ? "insufficient_credits" : error.message);
    err.name = error.message.includes("insufficient") ? "InsufficientCredits" : "SpendError";
    throw err;
  }
  return Number(data ?? 0);
}

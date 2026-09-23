import { promises as fs } from "fs";
import path from "path";
import type {
  FileTree,
  Message,
  Project,
  ProjectVersion,
  SessionUser,
  TemplateId,
} from "@/lib/types";
import type { SiteRecord, Subscription } from "@/lib/site/types";
import { TRIAL_CREDITS } from "@/lib/env";

export const LOCAL_SESSION_COOKIE = "ss_studio_session";

export type Db = {
  users: Record<string, SessionUser>;
  sessions: Record<string, string>;
  projects: Project[];
  versions: ProjectVersion[];
  messages: Message[];
  ledger: {
    id: string;
    userId: string;
    delta: number;
    reason: string;
    refId: string | null;
    createdAt: string;
  }[];
  sites: SiteRecord[];
  subscriptions: Record<string, Subscription>;
};

const emptyDb = (): Db => ({
  users: {},
  sessions: {},
  projects: [],
  versions: [],
  messages: [],
  ledger: [],
  sites: [],
  subscriptions: {},
});

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_DATA_FILE = path.join(process.cwd(), ".data", "store.json");
const VERCEL_DATA_DIR = "/tmp/studio-data";
const VERCEL_DATA_FILE = "/tmp/studio-data/store.json";

function dataPath() {
  if (process.env.VERCEL) {
    return { root: VERCEL_DATA_DIR, file: VERCEL_DATA_FILE };
  }
  return { root: LOCAL_DATA_DIR, file: LOCAL_DATA_FILE };
}

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readDb(): Promise<Db> {
  const { file } = dataPath();
  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Db>;
    return {
      ...emptyDb(),
      ...parsed,
      sites: parsed.sites ?? [],
      subscriptions: parsed.subscriptions ?? {},
    };
  } catch {
    return emptyDb();
  }
}

async function writeDb(db: Db) {
  const { root, file } = dataPath();
  await fs.mkdir(/* turbopackIgnore: true */ root, { recursive: true });
  await fs.writeFile(/* turbopackIgnore: true */ file, JSON.stringify(db, null, 2), "utf8");
}

export function now() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}

function id() {
  return newId();
}

export { withLock, readDb, writeDb };

export async function localGetUserBySession(token: string | undefined) {
  if (!token) return null;
  return withLock(async () => {
    const db = await readDb();
    const userId = db.sessions[token];
    return userId ? db.users[userId] ?? null : null;
  });
}

export async function localLogin(email: string) {
  const normalized = email.trim().toLowerCase();
  return withLock(async () => {
    const db = await readDb();
    let user = Object.values(db.users).find((u) => u.email === normalized);
    if (!user) {
      user = { id: id(), email: normalized };
      db.users[user.id] = user;
      db.ledger.push({
        id: id(),
        userId: user.id,
        delta: TRIAL_CREDITS,
        reason: "trial_grant",
        refId: null,
        createdAt: now(),
      });
    }
    const token = id();
    db.sessions[token] = user.id;
    await writeDb(db);
    return { user, token };
  });
}

export async function localLogout(token: string | undefined) {
  if (!token) return;
  return withLock(async () => {
    const db = await readDb();
    delete db.sessions[token];
    await writeDb(db);
  });
}

export async function localListProjects(userId: string) {
  return withLock(async () => {
    const db = await readDb();
    return db.projects
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
}

export async function localGetProject(userId: string, projectId: string) {
  return withLock(async () => {
    const db = await readDb();
    return db.projects.find((p) => p.id === projectId && p.userId === userId) ?? null;
  });
}

export async function localCreateProject(input: {
  userId: string;
  name: string;
  templateId: TemplateId;
  files: FileTree;
}) {
  return withLock(async () => {
    const db = await readDb();
    const createdAt = now();
    const project: Project = {
      id: id(),
      userId: input.userId,
      name: input.name,
      templateId: input.templateId,
      createdAt,
      updatedAt: createdAt,
    };
    db.projects.unshift(project);
    db.versions.push({
      id: id(),
      projectId: project.id,
      files: input.files,
      prompt: null,
      createdAt,
    });
    await writeDb(db);
    return project;
  });
}

export async function localRenameProject(userId: string, projectId: string, name: string) {
  return withLock(async () => {
    const db = await readDb();
    const project = db.projects.find((p) => p.id === projectId && p.userId === userId);
    if (!project) return null;
    project.name = name;
    project.updatedAt = now();
    await writeDb(db);
    return project;
  });
}

export async function localLatestVersion(projectId: string) {
  return withLock(async () => {
    const db = await readDb();
    return (
      db.versions
        .filter((v) => v.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
    );
  });
}

export async function localAddVersion(input: {
  projectId: string;
  files: FileTree;
  prompt: string;
}) {
  return withLock(async () => {
    const db = await readDb();
    const version: ProjectVersion = {
      id: id(),
      projectId: input.projectId,
      files: input.files,
      prompt: input.prompt,
      createdAt: now(),
    };
    db.versions.push(version);
    const project = db.projects.find((p) => p.id === input.projectId);
    if (project) project.updatedAt = version.createdAt;
    await writeDb(db);
    return version;
  });
}

export async function localListMessages(projectId: string) {
  return withLock(async () => {
    const db = await readDb();
    return db.messages
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  });
}

export async function localAddMessage(input: {
  projectId: string;
  role: "user" | "assistant";
  content: string;
  creditsUsed?: number;
}) {
  return withLock(async () => {
    const db = await readDb();
    const message: Message = {
      id: id(),
      projectId: input.projectId,
      role: input.role,
      content: input.content,
      creditsUsed: input.creditsUsed ?? 0,
      createdAt: now(),
    };
    db.messages.push(message);
    await writeDb(db);
    return message;
  });
}

export async function localBalance(userId: string) {
  return withLock(async () => {
    const db = await readDb();
    return db.ledger
      .filter((row) => row.userId === userId)
      .reduce((sum, row) => sum + row.delta, 0);
  });
}

export async function localSpendCredits(
  userId: string,
  amount: number,
  reason: string,
  refId?: string,
) {
  return withLock(async () => {
    const db = await readDb();
    const balance = db.ledger
      .filter((row) => row.userId === userId)
      .reduce((sum, row) => sum + row.delta, 0);
    if (balance < amount) {
      const err = new Error("insufficient_credits");
      err.name = "InsufficientCredits";
      throw err;
    }
    db.ledger.push({
      id: id(),
      userId,
      delta: -amount,
      reason,
      refId: refId ?? null,
      createdAt: now(),
    });
    await writeDb(db);
    return balance - amount;
  });
}

export async function localEnsureTrial(userId: string) {
  return withLock(async () => {
    const db = await readDb();
    const hasGrant = db.ledger.some(
      (row) => row.userId === userId && row.reason === "trial_grant",
    );
    if (!hasGrant) {
      db.ledger.push({
        id: id(),
        userId,
        delta: TRIAL_CREDITS,
        reason: "trial_grant",
        refId: null,
        createdAt: now(),
      });
      await writeDb(db);
    }
  });
}

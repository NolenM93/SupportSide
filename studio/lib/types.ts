export type FileTree = Record<string, string>;

export type TemplateId = "blank" | "inventory" | "portal" | "booking";

export type Project = {
  id: string;
  userId: string;
  name: string;
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
};

export type ProjectVersion = {
  id: string;
  projectId: string;
  files: FileTree;
  prompt: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  creditsUsed: number;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
};

export type CreditLedgerRow = {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  refId: string | null;
  createdAt: string;
};

export type GenerateEvent =
  | { type: "status"; message: string }
  | { type: "assistant"; content: string }
  | { type: "files"; files: FileTree; name?: string }
  | {
      type: "done";
      creditsUsed: number;
      balance: number;
      versionId: string;
      projectName: string;
      usedModel: boolean;
    }
  | { type: "error"; error: string; code?: string };

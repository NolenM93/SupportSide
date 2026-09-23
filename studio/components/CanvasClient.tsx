"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatBubble } from "@/components/ChatBubble";
import { Composer } from "@/components/Composer";
import { CreditsBadge } from "@/components/CreditsBadge";
import { DeviceFrame } from "@/components/DeviceFrame";
import { GlassSheet } from "@/components/GlassSheet";
import { SegmentedControl } from "@/components/SegmentedControl";
import { quoteUrl } from "@/lib/env";
import { assemblePreviewDocument, PREVIEW_SANDBOX } from "@/lib/preview/iframe";
import type { FileTree, GenerateEvent, Message, Project } from "@/lib/types";

export function CanvasClient({
  project,
  initialFiles,
  initialMessages,
  initialBalance,
  autoPrompt,
  aiLive,
}: {
  project: Project;
  initialFiles: FileTree;
  initialMessages: Message[];
  initialBalance: number;
  autoPrompt?: string;
  aiLive: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [files, setFiles] = useState(initialFiles);
  const [balance, setBalance] = useState(initialBalance);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(initialBalance < 8);
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const [codeFile, setCodeFile] = useState("index.html");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const sentAuto = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);

  const srcDoc = useMemo(() => assemblePreviewDocument(files), [files]);
  const fileNames = Object.keys(files);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function generate(prompt: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setStatus("Sending…");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        projectId: project.id,
        role: "user",
        content: prompt,
        creditsUsed: 0,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, prompt }),
      });
      if (!res.body) throw new Error("No response stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as GenerateEvent;
          if (event.type === "status") setStatus(event.message);
          if (event.type === "assistant") {
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                projectId: project.id,
                role: "assistant",
                content: event.content,
                creditsUsed: 0,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
          if (event.type === "files") {
            setFiles(event.files);
            if (event.name) setName(event.name);
          }
          if (event.type === "done") {
            setBalance(event.balance);
            setOutOfCredits(event.balance < 8);
            setName(event.projectName);
            setStatus(null);
          }
          if (event.type === "error") {
            setError(event.error);
            if (event.code === "insufficient_credits") setOutOfCredits(true);
            setStatus(null);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!autoPrompt || sentAuto.current) return;
    sentAuto.current = true;
    void generate(autoPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrompt]);

  const preview = (
    <iframe
      title="App preview"
      className="h-full w-full border-0 bg-white"
      sandbox={PREVIEW_SANDBOX}
      srcDoc={srcDoc}
    />
  );

  return (
    <div className="tab-safe flex min-h-dvh flex-col">
      <header className="glass-nav sticky top-0 z-20 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--blue)]">
              <Link href="/">Projects</Link>
            </p>
            <h1 className="truncate text-[17px] font-semibold">{name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CreditsBadge balance={balance} />
            <span className="chip hidden sm:inline-flex">
              {aiLive ? "OpenAI" : "Local"}
            </span>
            <div className="hidden sm:block">
              <SegmentedControl
                value={mode}
                options={[
                  { id: "preview", label: "Preview" },
                  { id: "code", label: "Code" },
                ]}
                onChange={(id) => setMode(id as "preview" | "code")}
              />
            </div>
            <button
              type="button"
              className="ios-btn ios-btn-ghost px-3 py-2 text-sm sm:hidden"
              onClick={() => setSheetOpen(true)}
            >
              Preview
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 md:grid-cols-[minmax(280px,1fr)_minmax(320px,1fr)] lg:grid-cols-[400px_1fr]">
        <section className="flex min-h-0 flex-col border-white/10 md:border-r">
          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {!aiLive && (
              <div className="glass-card rounded-2xl p-4 text-sm">
                <p className="font-semibold">Using the local builder</p>
                <p className="mt-1 text-[var(--secondary)]">
                  For real AI designs, create an OpenAI key, set a monthly spend cap, paste it into{" "}
                  <code className="text-[var(--label)]">studio/.env.local</code>, and restart the
                  server. The key never goes to the browser. See Account for the steps.
                </p>
                <Link href="/account" className="mt-2 inline-block font-semibold text-[var(--blue)]">
                  Open Account
                </Link>
              </div>
            )}
            {messages.length === 0 && (
              <p className="text-sm text-[var(--secondary)]">
                Tell Studio what this app should do. It will keep the current preview and iterate.
              </p>
            )}
            {messages.map((message) => (
              <ChatBubble key={message.id} role={message.role}>
                {message.content}
              </ChatBubble>
            ))}
            {status && (
              <p className="text-sm text-[var(--secondary)]">{status}</p>
            )}
            {error && <p className="text-sm text-[var(--red)]">{error}</p>}
            {outOfCredits && (
              <div className="glass-card rounded-2xl p-4">
                <p className="font-semibold">You&apos;re out of trial credits</p>
                <p className="mt-1 text-sm text-[var(--secondary)]">
                  Billing isn&apos;t live yet. Add credits later, or have Support Side build this for you.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <button type="button" className="ios-btn" disabled>
                    Add credits — coming soon
                  </button>
                  <a
                    className="ios-btn ios-btn-ghost"
                    href={quoteUrl({ source: "studio", project: project.id })}
                  >
                    Have Support Side build this
                  </a>
                </div>
              </div>
            )}
          </div>
          <Composer disabled={busy || outOfCredits} onSend={generate} />
        </section>

        <section className="hidden min-h-0 flex-col p-4 md:flex">
          {mode === "preview" ? (
            <DeviceFrame title={name}>{preview}</DeviceFrame>
          ) : (
            <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
              <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-2">
                {fileNames.map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => setCodeFile(file)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      codeFile === file ? "bg-white/15" : "text-[var(--secondary)]"
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <pre className="code-view flex-1 overflow-auto p-4 text-xs text-[var(--secondary)]">
                {files[codeFile] ?? ""}
              </pre>
            </div>
          )}
        </section>
      </div>

      <GlassSheet open={sheetOpen} title="Live preview" onClose={() => setSheetOpen(false)}>
        <div className="h-[70dvh] overflow-hidden rounded-2xl bg-white">{preview}</div>
      </GlassSheet>
    </div>
  );
}

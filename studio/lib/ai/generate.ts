import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { creditsForUsage } from "@/lib/credits";
import { isOpenAIConfigured, OPENAI_MODEL, redactSecrets } from "@/lib/env";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/system-prompt";
import { generateLocalApp } from "@/lib/ai/local-generate";
import type { FileTree, TemplateId } from "@/lib/types";

const fileSchema = z.object({
  name: z.string(),
  assistantMessage: z.string(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    }),
  ),
});

export type GenerateResult = {
  name: string;
  assistantMessage: string;
  files: FileTree;
  creditsUsed: number;
  usedModel: boolean;
};

function toFileTree(files: { path: string; content: string }[]): FileTree {
  const tree: FileTree = {};
  for (const file of files) {
    const path = file.path.replace(/^\.?\//, "");
    if (path) tree[path] = file.content;
  }
  if (!tree["index.html"]) {
    tree["index.html"] =
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>App</title><link rel="stylesheet" href="styles.css"></head><body><main class="app"><h1>App</h1></main><script src="app.js"></script></body></html>';
  }
  return tree;
}

export async function generateApp(input: {
  prompt: string;
  templateId: TemplateId;
  files: FileTree;
}): Promise<GenerateResult> {
  if (!isOpenAIConfigured()) {
    const local = generateLocalApp(input);
    return {
      name: local.name,
      assistantMessage: local.assistantMessage,
      files: local.files,
      creditsUsed: creditsForUsage(),
      usedModel: false,
    };
  }

  try {
    const { output, usage } = await generateText({
      model: openai(OPENAI_MODEL),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(input),
      output: Output.object({ schema: fileSchema }),
    });

    if (!output) {
      throw new Error("The model did not return an app. Try a shorter prompt.");
    }

    const usageRecord = usage as
      | { totalTokens?: number; inputTokens?: number; outputTokens?: number }
      | undefined;
    const totalTokens =
      usageRecord?.totalTokens ??
      (usageRecord?.inputTokens ?? 0) + (usageRecord?.outputTokens ?? 0);

    return {
      name: output.name,
      assistantMessage: output.assistantMessage,
      files: toFileTree(output.files),
      creditsUsed: creditsForUsage(totalTokens),
      usedModel: true,
    };
  } catch (err) {
    const message = redactSecrets(
      err instanceof Error ? err.message : "OpenAI generation failed.",
    );
    throw new Error(message);
  }
}

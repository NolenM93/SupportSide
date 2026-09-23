import type { FileTree, TemplateId } from "@/lib/types";
import {
  kindFromTemplate,
  mergeSpec,
  readSpec,
  specFromPrompt,
} from "@/lib/ai/spec";
import { describeSpec, renderApp } from "@/lib/ai/render-app";

export function generateLocalApp(input: {
  prompt: string;
  templateId: TemplateId;
  files: FileTree;
}) {
  const existing = readSpec(input.files);
  const iterating = Boolean(existing);
  const spec = existing
    ? mergeSpec(existing, input.prompt)
    : specFromPrompt(input.prompt, kindFromTemplate(input.templateId));

  return {
    name: spec.name,
    assistantMessage: describeSpec(spec, iterating),
    files: renderApp(spec),
    spec,
  };
}

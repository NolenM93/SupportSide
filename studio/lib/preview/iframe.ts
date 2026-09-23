import type { FileTree } from "@/lib/types";

const STORAGE_SHIM = `
<script>
(function () {
  try {
    void window.localStorage.length;
    return;
  } catch (e) {}
  var mem = {};
  var storage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; },
    clear: function () { mem = {}; },
    key: function (i) { return Object.keys(mem)[i] || null; },
    get length() { return Object.keys(mem).length; }
  };
  try { Object.defineProperty(window, "localStorage", { value: storage }); } catch (e) {}
})();
</script>
`;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripParentEscape(source: string) {
  return source
    .replace(/\bwindow\.parent\b/g, "window")
    .replace(/\bwindow\.top\b/g, "window")
    .replace(/\btop\.location\b/g, "window.location");
}

function inlineAssets(html: string, files: FileTree) {
  let next = html;

  for (const [path, content] of Object.entries(files)) {
    if (path === "index.html") continue;
    const safe = escapeRegExp(path);

    if (path.endsWith(".css")) {
      const link = new RegExp(
        `<link[^>]+href=["']${safe}["'][^>]*>`,
        "gi",
      );
      next = next.replace(link, `<style>\n${content}\n</style>`);
    }

    if (path.endsWith(".js")) {
      const script = new RegExp(
        `<script[^>]+src=["']${safe}["'][^>]*><\\/script>`,
        "gi",
      );
      next = next.replace(script, `<script>\n${stripParentEscape(content)}\n</script>`);
    }
  }

  return next;
}

export function assemblePreviewDocument(files: FileTree) {
  let html =
    files["index.html"] ??
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preview</title></head><body><p>No index.html yet.</p></body></html>`;

  html = inlineAssets(html, files);

  if (!html.includes("<head")) {
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  }

  html = html.replace(/<head[^>]*>/i, (match) => `${match}${STORAGE_SHIM}`);

  if (!/viewport/i.test(html)) {
    html = html.replace(
      /<head[^>]*>/i,
      (match) =>
        `${match}<meta name="viewport" content="width=device-width, initial-scale=1">`,
    );
  }

  return html;
}

export const PREVIEW_SANDBOX = "allow-scripts allow-forms allow-modals";

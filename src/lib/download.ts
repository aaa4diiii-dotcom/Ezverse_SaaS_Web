export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(name: string) {
  return name.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "output";
}

export function downloadTxt(baseName: string, content: string) {
  downloadText(`${safeName(baseName)}-${Date.now()}.txt`, content, "text/plain");
}

export function downloadMd(baseName: string, content: string) {
  downloadText(`${safeName(baseName)}-${Date.now()}.md`, content, "text/markdown");
}

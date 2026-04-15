export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "xlsx",
  "xls",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
  "ico",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "exe",
  "msi",
  "app",
  "deb",
  "rpm",
  "apk",
  "mp3",
  "mp4",
  "avi",
  "mkv",
  "mov",
  "flv",
  "webm",
  "m4a",
  "iso",
  "bin",
  "jar",
  "py",
  "js",
  "ts",
  "tsx",
  "jsx",
  "html",
  "css",
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function getFileExtension(fileName: string) {
  const segments = fileName.split(".");
  if (segments.length === 1) {
    return "unknown";
  }
  return segments.at(-1)?.toLowerCase() ?? "unknown";
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0000-\u001F\u007F]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .trim();
}

export function createStorageFileName(fileName: string) {
  const safeName = sanitizeFileName(fileName);
  return `${Date.now()}-${safeName}`;
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

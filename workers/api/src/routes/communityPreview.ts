import { Hono } from "hono";
import { type AppVariables, type Bindings } from "../env";
import type { CommunityPreview } from "../types/communityPreview";

export const communityPreviewRoutes = new Hono<{
  Bindings: Bindings;
  Variables: AppVariables;
}>();

const MAX_HTML_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 5000;
const PRIVATE_HOSTS = new Set(["localhost", "metadata.google.internal", "169.254.169.254"]);

const isPrivateIpv4 = (host: string): boolean => {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168);
};

const validateUrl = (value: string): URL => {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!['http:', 'https:'].includes(url.protocol) || PRIVATE_HOSTS.has(hostname) || isPrivateIpv4(hostname) || hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fe80:")) {
    throw new Error("URL is not allowed");
  }
  return url;
};

const decodeHtml = (value: string): string => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

const getMeta = (html: string, key: string): string | null => {
  const pattern = new RegExp(`<meta\\s+[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["'][^>]*>`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1] ?? match[2] ?? "") || null : null;
};

const getTitle = (html: string): string | null => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/<[^>]+>/g, "")) || null : null;
};

const readLimitedText = async (response: Response): Promise<string> => {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value ?? new Uint8Array();
    const allowed = chunk.slice(0, MAX_HTML_BYTES - total);
    chunks.push(allowed);
    total += allowed.length;
    if (allowed.length < chunk.length) break;
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
};

const fetchWithTimeout = async (url: URL): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { redirect: "manual", signal: controller.signal, headers: { Accept: "text/html,application/xhtml+xml" } });
  } finally { clearTimeout(timer); }
};

const fetchPreview = async (initialUrl: URL): Promise<CommunityPreview> => {
  let currentUrl = initialUrl;
  let response: Response | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await fetchWithTimeout(currentUrl);
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    if (!location) break;
    currentUrl = validateUrl(new URL(location, currentUrl).toString());
  }
  if (!response || !response.ok) throw new Error("Preview fetch failed");
  const html = await readLimitedText(response);
  const image = getMeta(html, "og:image");
  return {
    url: getMeta(html, "og:url") ?? currentUrl.toString(),
    title: getMeta(html, "og:title") ?? getTitle(html),
    description: getMeta(html, "og:description") ?? getMeta(html, "description"),
    image: image ? new URL(image, currentUrl).toString() : null,
    siteName: getMeta(html, "og:site_name") ?? currentUrl.hostname,
  };
};

communityPreviewRoutes.get("/communities/preview", async (c) => {
  const requestedUrl = c.req.query("url");
  if (!requestedUrl) return c.json({ error: { code: "BAD_REQUEST", message: "url is required" } }, 400);
  try {
    const preview = await fetchPreview(validateUrl(requestedUrl));
    return c.json(preview);
  } catch {
    return c.json({ error: { code: "PREVIEW_UNAVAILABLE", message: "Preview could not be loaded" } }, 422);
  }
});

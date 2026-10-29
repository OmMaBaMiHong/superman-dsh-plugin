/**
 * 热榜 reader 的抓取助手 —— 统一 UA / 超时 / 错误语义。
 *
 * 不引入 ofetch：热榜渠道只需要「GET/POST → text/JSON」这一条通路，
 * 直接用 Node 自带 fetch，单渠道超时 10s，失败抛出由 collector 隔离。
 */
import { load, type CheerioAPI } from 'cheerio';

export const READER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const DEFAULT_HEADERS: Readonly<Record<string, string>> = {
  'user-agent': READER_UA,
  accept: 'application/json, text/plain, */*',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

const DEFAULT_TIMEOUT_MS = 10_000;

export interface ReaderFetchInit {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  timeoutMs?: number;
}

/** 发一次请求；非 2xx 直接抛错（由调用方或 collector 决定降级策略）。 */
export async function fetchReaderResponse(url: string, init: ReaderFetchInit = {}): Promise<Response> {
  const response = await fetch(url, {
    method: init.method ?? 'GET',
    headers: { ...DEFAULT_HEADERS, ...(init.headers ?? {}) },
    body: init.body,
    signal: AbortSignal.timeout(init.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${body ? `: ${body.slice(0, 160)}` : ''}`);
  }
  return response;
}

export async function fetchText(url: string, init: ReaderFetchInit = {}): Promise<string> {
  return (await fetchReaderResponse(url, init)).text();
}

export async function fetchJson<T>(url: string, init: ReaderFetchInit = {}): Promise<T> {
  const response = await fetchReaderResponse(url, init);
  return (await response.json()) as T;
}

/** HTML → cheerio（各平台 DOM 选择器移植自 newsnow）。 */
export function loadHtml(html: string): CheerioAPI {
  return load(html);
}

export function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function numeric(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** 把站内相对链接补成绝对链接；空值/非法值返回 null。 */
export function absoluteUrl(base: string, href: string | null | undefined): string | null {
  const raw = href?.trim();
  if (!raw || raw.startsWith('javascript:') || raw === '#') return null;
  try {
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
}

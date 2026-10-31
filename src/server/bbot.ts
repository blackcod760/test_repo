import "server-only";

/**
 * Server-side proxy helper for the bbot backend.
 * The base URL and credentials come from env (see .env.example) and never
 * reach the client. Only route handlers may import this module.
 */

function baseUrl(): string {
  const url = process.env.BBOT_BASE_URL;
  if (!url) throw new Error("BBOT_BASE_URL is not set");
  return url.replace(/\/$/, "");
}

function authHeader(): string {
  const user = process.env.BBOT_AUTH_USER;
  const password = process.env.BBOT_AUTH_PASSWORD;
  if (!user || !password) throw new Error("BBOT_AUTH_USER/BBOT_AUTH_PASSWORD are not set");
  const token = Buffer.from(`${user}:${password}`).toString("base64");
  return `Basic ${token}`;
}

export async function bbotFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function proxyJson(path: string, init?: RequestInit): Promise<Response> {
  const upstream = await bbotFetch(path, init);
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}

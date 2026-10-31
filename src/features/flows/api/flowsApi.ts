import type { Flow } from "@/shared/types";

/**
 * SDK adapter layer — the only place the UI talks to the backend.
 * All calls go through Next.js route handlers (`/api/flows`), which proxy to
 * the bbot backend with server-side credentials. No auth material here.
 */

export interface FlowsApi {
  getFlow: (id: string) => Promise<Flow>;
  saveFlow: (flow: Flow) => Promise<Flow>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Flow API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  return res.json() as Promise<T>;
}

export const flowsApi: FlowsApi = {
  getFlow: (id) => request<Flow>(`/api/flows/${encodeURIComponent(id)}`),
  saveFlow: (flow) =>
    request<Flow>(`/api/flows/${encodeURIComponent(flow.id)}`, {
      method: "PUT",
      body: JSON.stringify(flow),
    }),
};

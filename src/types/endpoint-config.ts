export interface KnowledgeEndpointConfig {
  authBackendUrl: string;
  authPrefix: string;
}

export const defaultKnowledgeEndpointConfig: KnowledgeEndpointConfig = {
  authBackendUrl: "http://127.0.0.1:4510",
  authPrefix: "/api/v1/auth",
};

export type KnowledgeDataMode = "mock" | "remote";

export function getKnowledgeDataMode(): KnowledgeDataMode {
  const mode = import.meta.env.VITE_KNOWLEDGE_DATA_MODE ?? "mock";
  return mode === "remote" ? "remote" : "mock";
}

export function buildAuthUrl(
  config: KnowledgeEndpointConfig,
  path: string
): string {
  const base = config.authBackendUrl.replace(/\/$/, "");
  const prefix = config.authPrefix.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${normalizedPath}`;
}

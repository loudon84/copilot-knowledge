import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import {
  defaultKnowledgeEndpointConfig,
  type KnowledgeEndpointConfig,
} from "@/types/endpoint-config";

const CONFIG_FILE = "knowledge-endpoint-config.json";

let cachedConfig: KnowledgeEndpointConfig | null = null;

function getConfigPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE);
}

export function getEndpointConfig(): KnowledgeEndpointConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const filePath = getConfigPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedConfig = {
        ...defaultKnowledgeEndpointConfig,
        ...JSON.parse(raw),
      } as KnowledgeEndpointConfig;
      return cachedConfig;
    }
  } catch {
    // fall through to default
  }

  cachedConfig = { ...defaultKnowledgeEndpointConfig };
  return cachedConfig;
}

export function saveEndpointConfig(
  config: KnowledgeEndpointConfig
): KnowledgeEndpointConfig {
  cachedConfig = { ...defaultKnowledgeEndpointConfig, ...config };
  const filePath = getConfigPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(cachedConfig, null, 2), "utf-8");
  return cachedConfig;
}

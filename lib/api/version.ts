import { settings } from "@/settings";

export interface ApiVersionResponse {
  name: string;
  version: string;
  author: string;
  environment: string;
  production: boolean;
}

export async function getApiVersion(timeout = 10000) {
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${settings.default.api_url}/about`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error();

    const data = (await response.json()) as ApiVersionResponse;

    return {
      status: "online" as const,
      ...data,
    };
  } catch {
    return {
      status: "error" as const,
      name: "",
      version: "",
      environment: "",
      production: false,
    };
  } finally {
    clearTimeout(timer);
  }
}

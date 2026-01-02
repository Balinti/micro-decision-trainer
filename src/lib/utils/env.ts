export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnvVar(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

export function getAppUrl(): string {
  return getOptionalEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

import { methodology } from "../domain/engine.ts";
import type { Release } from "../domain/model.ts";
import { pointerResponse, publicManifest } from "./public-schema.ts";
import { publicRelease } from "./release.ts";

type Config = { origin: string; apiKey: string };
const maxManifestBytes = 2 * 1024 * 1024;

async function readJson(response: Response): Promise<unknown> {
  if (!response.ok || !response.body) throw new Error("Data store unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let json = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxManifestBytes) {
      await reader.cancel();
      throw new Error("Manifest size exceeded");
    }
    json += decoder.decode(value, { stream: true });
  }
  return JSON.parse(json + decoder.decode());
}

export async function loadPublicRelease(
  config: Config,
  request: typeof fetch = fetch,
): Promise<Release> {
  const origin = new URL(config.origin);
  if (
    origin.protocol !== "https:" ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(origin.hostname) ||
    origin.username ||
    origin.password ||
    origin.port ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    !config.apiKey.startsWith("sb_publishable_")
  )
    throw new Error("Invalid read-only data store configuration");
  const endpoint = new URL(
    "/rest/v1/active_manifest?select=id,methodology,fingerprint,revoked,manifest&limit=2",
    origin,
  );
  const response = await request(endpoint, {
    method: "GET",
    cache: "no-store",
    redirect: "error",
    headers: { "Accept-Profile": "money_public", apikey: config.apiKey },
    signal: AbortSignal.timeout(3500),
  });
  const [pointer] = pointerResponse.parse(await readJson(response));
  if (!pointer) return publicRelease;
  if (pointer.revoked)
    return { ...publicRelease, id: pointer.id, revoked: true };
  const manifest = publicManifest.parse(pointer.manifest);
  if (manifest.id !== pointer.id || pointer.methodology !== methodology.version)
    throw new Error("Manifest identity or methodology mismatch");
  return manifest;
}

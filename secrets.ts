import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createDecipheriv, createCipheriv, randomBytes } from "crypto";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server database credentials are not configured.");
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
function encryptionKey() {
  const raw = process.env.SECRETS_ENCRYPTION_KEY;
  if (!raw) throw new Error("SECRETS_ENCRYPTION_KEY is not configured.");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("SECRETS_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  return key;
}
export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(".");
}
export function decryptSecret(value: string) {
  const [iv, tag, ciphertext] = value.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}
export async function getTwelveDataKey() {
  const db = serviceClient();
  const { data, error } = await db.from("server_secrets").select("encrypted_value").eq("secret_name", "TWELVE_DATA_API_KEY").maybeSingle();
  if (error) throw new Error("Unable to read provider configuration.");
  if (data?.encrypted_value) return decryptSecret(data.encrypted_value);
  return process.env.TWELVE_DATA_API_KEY || null;
}
export async function saveTwelveDataKey(value: string) {
  const db = serviceClient();
  const { error } = await db.from("server_secrets").upsert({
    secret_name: "TWELVE_DATA_API_KEY",
    encrypted_value: encryptSecret(value),
    updated_at: new Date().toISOString()
  }, { onConflict: "secret_name" });
  if (error) throw new Error("Unable to save provider configuration.");
}

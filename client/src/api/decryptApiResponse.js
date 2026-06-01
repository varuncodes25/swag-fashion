import { CareerDecrypt } from "../utils/crypto";

function unwrapApiEnvelope(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    typeof payload.statusCode === "number" &&
    "data" in payload
  ) {
    return payload.data;
  }
  return payload;
}

/**
 * Decrypt API payloads from server ({ data: "cipher..." } or raw cipher string).
 */
export async function decryptApiResponse(data) {
  if (data == null) return data;

  let decrypted = data;

  try {
    if (typeof data === "string") {
      decrypted = await CareerDecrypt(data);
    } else if (data.data && typeof data.data === "string") {
      decrypted = await CareerDecrypt(data.data);
    } else if (data.encryptedData && typeof data.encryptedData === "string") {
      decrypted = await CareerDecrypt(data.encryptedData);
    }
  } catch {
    return data;
  }

  return unwrapApiEnvelope(decrypted);
}

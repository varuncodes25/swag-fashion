const { CareerEncrypt } = require("./crypto");
const ApiResponse = require("./handlar/ApiResponse");

/**
 * Encrypt API response (used in auth/admin controllers).
 * Global encryptResponse.middleware also encrypts res.json() for ALL /api routes.
 * If this returns { data: cipher }, middleware skips (no double encryption).
 */
const encryptResponse = async (data) => {
  const shouldEncrypt =
    process.env.DISABLE_ENCRYPT_RESPONSE !== "true" &&
    (process.env.ENCRYPT_RESPONSE === "1" ||
      process.env.ENCRYPT_RESPONSE === "true");

  // If already ApiResponse format
  const isApiResponse = data && 
    typeof data === "object" && 
    "statusCode" in data && 
    "data" in data && 
    "message" in data;

  const safeData = isApiResponse ? data : new ApiResponse(200, data, "Success");

  if (!shouldEncrypt) return safeData;

  try {
    const encrypted = await CareerEncrypt(safeData);
    return { data: encrypted };
  } catch (error) {
    console.error("Encryption failed:", error);
    return safeData; // Fallback to unencrypted
  }
};

module.exports = encryptResponse;
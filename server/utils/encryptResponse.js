const { CareerEncrypt } = require("./crypto");

/**
 * Encrypt API response if enabled
 * @param {any} data - Response data (can be ApiResponse or raw data)
 * @returns {Object} Formatted and optionally encrypted response
 */
const encryptResponse = async (data) => {
  const shouldEncrypt = process.env.ENCRYPT_RESPONSE === "1";

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
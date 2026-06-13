const { CareerEncrypt } = require("./crypto");
const ApiResponse = require("./handlar/ApiResponse");

const isEncryptionDisabled = () =>
  process.env.DISABLE_ENCRYPT_RESPONSE === "true";

/**
 * Encrypt API response (auth/admin controllers).
 * Returns { data: cipher } — global middleware skips re-encryption when already encrypted.
 */
const encryptResponse = async (data, statusCode = 200) => {
  const isApiResponse =
    data &&
    typeof data === "object" &&
    "statusCode" in data &&
    "data" in data &&
    "message" in data;

  const safeData = isApiResponse
    ? data
    : new ApiResponse(statusCode, data, data?.message || "Success");

  if (isEncryptionDisabled()) {
    return safeData;
  }

  try {
    const encrypted = await CareerEncrypt(safeData);
    return { data: encrypted };
  } catch (error) {
    console.error("Encryption failed:", error.message);
    const fallback = new ApiResponse(
      statusCode >= 400 ? statusCode : 500,
      null,
      "Response encryption failed",
    );
    const encrypted = await CareerEncrypt(fallback);
    return { data: encrypted };
  }
};

module.exports = encryptResponse;

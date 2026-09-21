import { createHmac, timingSafeEqual } from "crypto";
import { getEnv } from "./env";

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

export function parseSignedRequest(signedRequest: string): { user_id?: string } {
  const [encodedSig, payload] = signedRequest.split(".");
  if (!encodedSig || !payload) {
    throw new Error("Instagram sent a malformed signed_request. The data-deletion callback cannot run.");
  }

  const sig = base64UrlDecode(encodedSig);
  const expected = createHmac("sha256", getEnv().instagramAppSecret).update(payload).digest();
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) {
    throw new Error("signed_request signature did not match. Check INSTAGRAM_APP_SECRET.");
  }

  const data = JSON.parse(base64UrlDecode(payload).toString("utf8")) as {
    algorithm?: string;
    user_id?: string;
  };

  if (data.algorithm && data.algorithm.toUpperCase() !== "HMAC-SHA256") {
    throw new Error(`Unsupported signed_request algorithm: ${data.algorithm}`);
  }

  return data;
}

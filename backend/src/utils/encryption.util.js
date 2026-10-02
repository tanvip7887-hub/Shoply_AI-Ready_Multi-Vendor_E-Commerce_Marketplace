import crypto from "crypto";
import env from "../config/env.js";

const ALGORITHM = "aes-256-cbc";
// Key must be exactly 32 bytes for AES-256. Derived from an env secret
// via SHA-256 so the .env value itself can be any length/passphrase.
const KEY = crypto.createHash("sha256").update(env.PAYOUT_ENCRYPTION_SECRET).digest();

export const encrypt = (plainText) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    // IV is stored alongside the ciphertext (not secret) — required to decrypt.
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (encryptedText) => {
    const [ivHex, dataHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
};
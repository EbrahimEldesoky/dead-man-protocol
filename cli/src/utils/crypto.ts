import * as crypto from 'crypto';

export function encryptWill(willData: string): { encryptedData: Buffer, key: Buffer } {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(willData, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Pack IV (16), Tag (16), and Encrypted ciphertext
  const encryptedData = Buffer.concat([iv, tag, encrypted]);
  return { encryptedData, key };
}

export function decryptWill(encryptedData: Buffer, key: Buffer): string {
  const iv = encryptedData.subarray(0, 16);
  const tag = encryptedData.subarray(16, 32);
  const ciphertext = encryptedData.subarray(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

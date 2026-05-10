import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

@Injectable()
export class SecretEncryptionService {
  encrypt(plainText: string, keyMaterial: string): string {
    const key = createHash('sha256').update(keyMaterial).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  decrypt(payload: string, keyMaterial: string): string {
    const [ivText, tagText, encryptedText] = payload.split('.');
    if (!ivText || !tagText || !encryptedText) throw new Error('Invalid encrypted secret payload');
    const key = createHash('sha256').update(keyMaterial).digest();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64url')),
      decipher.final()
    ]).toString('utf8');
  }
}

const REQUIRED_ENV = [
  'APP_PUBLIC_URL',
  'API_PUBLIC_URL',
  'DATABASE_URL',
  'DATABASE_SSL_MODE',
  'CORS_ALLOWED_ORIGINS',
  'SESSION_SECRET_FILE',
  'MFA_ENCRYPTION_KEY_FILE',
  'BACKUP_ENCRYPTION_KEY_FILE'
];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing production readiness environment variables: ${missing.join(', ')}`);
}

if (process.env.DATABASE_SSL_MODE === 'disable') {
  throw new Error('Production readiness requires PostgreSQL TLS');
}

if (process.env.COOKIE_SECURE !== 'true') {
  throw new Error('Production readiness requires secure cookies');
}

process.stdout.write('Production readiness environment checks passed. Verify TLS, encrypted storage, backups, restore rehearsal, logs, alerts, and audit immutability evidence manually before launch.\n');

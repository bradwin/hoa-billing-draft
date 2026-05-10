import { loadWorkerConfig } from './config/worker-config';
import { logWorkerEvent } from './logger';
import { describeSupportIntentMode } from './jobs/support-intent-status';

export async function startWorker(): Promise<void> {
  loadWorkerConfig();
  logWorkerEvent('info', 'worker started', {
    supportIntentMode: describeSupportIntentMode()
  });
}

if (require.main === module) {
  void startWorker();
}

type Job = () => Promise<void>;

const queue: Job[] = [];
let draining = false;
const MIN_INTERVAL_MS = 100;

async function drain() {
  if (draining) return;
  draining = true;
  try {
    while (queue.length > 0) {
      const job = queue.shift();
      if (job) {
        await job();
      }
      if (queue.length > 0) {
        await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS));
      }
    }
  } finally {
    draining = false;
    if (queue.length > 0) {
      void drain();
    }
  }
}

/** Serialize outbound mail to reduce Resend burst / HTTP 429. */
export function enqueueMail(job: Job): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        await job();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
    void drain();
  });
}

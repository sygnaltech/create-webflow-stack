import * as p from '@clack/prompts';

export function assertNotCancelled(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';

export function ensureClaudeInstalled() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
  } catch {
    p.cancel(
      'Claude CLI not found on PATH. Install Claude Code from https://docs.claude.com/claude-code and re-run.'
    );
    process.exit(1);
  }
}

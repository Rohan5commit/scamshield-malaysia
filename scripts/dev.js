import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev:backend']],
  ['npm', ['run', 'dev:frontend']]
];

const children = [];

for (const [command, args] of commands) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  children.push(child);

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

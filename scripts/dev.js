import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev:backend']],
  ['npm', ['run', 'dev:frontend']]
];

for (const [command, args] of commands) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}


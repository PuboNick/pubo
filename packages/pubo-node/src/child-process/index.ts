import { ChildProcess } from 'child_process';

export const createChildProcess = (fn, ...args): ChildProcess => {
  const subprocess = fn(...args);
  process.on('SIGTERM', () => subprocess.kill());
  return subprocess;
};

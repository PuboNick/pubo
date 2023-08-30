import { ChildProcess } from 'child_process';
import kill from 'tree-kill';

export const createChildProcess = (fn, ...args): ChildProcess => {
  const subprocess = fn(...args);
  const dispose = subprocess.kill.bind(subprocess);
  subprocess.kill = () => {
    dispose();
    kill(parseInt(subprocess.pid));
  };
  process.on('SIGTERM', () => subprocess.kill());
  process.on('exit', () => subprocess.kill());

  return subprocess;
};

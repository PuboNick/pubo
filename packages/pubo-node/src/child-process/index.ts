import kill from 'tree-kill';

export const SIGKILL = (pid: number) => {
  kill(pid, 'SIGKILL');
};

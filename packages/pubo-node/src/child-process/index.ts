import { exec } from 'child_process';
import { waitFor } from 'pubo-utils';

export async function getProcessName(pid): Promise<string> {
  return new Promise((resolve) => {
    let child: any = exec(`grep "Name:" /proc/${pid}/status`);
    let resolved = false;
    const cb = (data) => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(data);
      child = null;
    };
    child.stdout.on('data', (data) => cb(data.toString()));
    child.stderr.on('data', (data) => cb(data.toString()));
  });
}

export async function isProcessAlive(pid) {
  const name = await getProcessName(pid);
  return name.split(':')[2]?.trim() === 'No such file or directory';
}

export async function SIGKILL(pid: number, type = 2) {
  if (process.platform === 'win32') {
    const signal = type === 9 ? 'SIGKILL' : 'SIGINT';
    require('tree-kill')(pid, signal);
    return;
  }

  exec(`kill -${type} ${pid}`);

  try {
    await waitFor(async () => isProcessAlive(pid), { checkTime: 100, timeout: 10000 });
  } catch (err) {
    await SIGKILL(pid, 9);
  }
}

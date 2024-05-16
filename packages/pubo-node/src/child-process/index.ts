import { exec } from 'child_process';
import { waitFor } from 'pubo-utils';
import kill from 'tree-kill';

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

export async function SIGKILL(pid: number) {
  kill(pid, 'SIGKILL');

  if (process.platform === 'win32') {
    return;
  }

  exec(`kill -9 ${pid}`);

  try {
    await waitFor(async () => isProcessAlive(pid), { checkTime: 100, timeout: 10000 });
  } catch (err) {
    await SIGKILL(pid);
  }
}

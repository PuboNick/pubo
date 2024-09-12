import { exec } from 'child_process';
import { waitFor } from 'pubo-utils';

// 获取进程名称
export function getProcessName(pid): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`grep "Name:" /proc/${pid}/status`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// 获取进程 cpu 使用率
export function getProcessCpuUseByPid(pid: number): Promise<number> {
  return new Promise((resolve) => {
    exec(`ps -p ${pid} -o %cpu=`, (err, stdout) => {
      if (err) {
        resolve(-1);
      } else {
        resolve(parseFloat(stdout.toString()));
      }
    });
  });
}

// 获取进程 command 使用率
export function getProcessCommandByPid(pid: number): Promise<string> {
  return new Promise((resolve) => {
    exec(`ps -p ${pid} -o command=`, (err, stdout) => {
      if (err) {
        resolve('');
      } else {
        resolve(stdout.toString().split('\n')[0]);
      }
    });
  });
}

// 判断进程是否死亡
export async function isProcessDied(pid) {
  const used = await getProcessCpuUseByPid(pid);
  return used < 0;
}

// 获取子进程
export function getProcessByPpid(pid: number): Promise<number[]> {
  return new Promise((resolve) => {
    exec(`ps -o pid --no-headers --ppid ${pid}`, (err, stdout) => {
      if (err) {
        resolve([]);
      } else {
        resolve(
          stdout
            .split('\n')
            .filter((item) => !!item)
            .map((item) => parseFloat(item.trim())),
        );
      }
    });
  });
}

// 获取进程树
export const getProcessTree = async (pid: number, tree?: any) => {
  if (!tree) {
    tree = { pid, children: [] };
  }
  const pids = await getProcessByPpid(pid);
  for (const id of pids) {
    const item = { pid: id, children: [] };
    await getProcessTree(id, item);
    tree.children.push(item);
  }
  return tree;
};

// 杀死进程
async function _SIGKILL(pid, signal = 2) {
  if (process.platform === 'win32') {
    process.kill(pid, signal);
    return;
  }

  console.log(`kill -${signal} ${pid}`);
  exec(`kill -${signal} ${pid}`);
  try {
    await waitFor(async () => isProcessDied(pid), { checkTime: 100, timeout: 10000 });
  } catch (err) {
    await SIGKILL(pid, 9);
  }
}

const forEach = (tree: any, tmp: any[]) => {
  if (tree.children) {
    tree.children.forEach((item) => {
      tmp.push(item.pid);
      forEach(item, tmp);
    });
  }
};

export async function SIGKILL(pid: number, signal = 2) {
  if (process.platform === 'win32') {
    return new Promise((resolve, reject) => {
      exec(`taskkill /pid ${pid} /T /F`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('');
        }
      });
    });
  }

  const tree = await getProcessTree(pid);
  const tmp = [tree.pid];
  forEach(tree, tmp);
  tmp.reverse();

  for (const item of tmp) {
    await _SIGKILL(item, signal);
  }
  return 'success';
}

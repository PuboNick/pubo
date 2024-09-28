import { exec } from 'child_process';
import { loop, waitFor } from 'pubo-utils';

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
  let isRoot = false;
  if (!tree) {
    isRoot = true;
    tree = { pid, children: [] };
  }
  const pids = await getProcessByPpid(pid);
  for (const id of pids) {
    const item = { pid: id, children: [] };
    await getProcessTree(id, item);
    tree.children.push(item);
  }
  if (isRoot) {
    return tree;
  } else {
    tree = null;
  }
};

// 杀死进程
async function _SIGKILL(pid, signal = 2, times = 1) {
  if (times > 5) {
    throw new Error('SIGKILL 失败. times > 5');
  }

  exec(`kill -${signal} ${pid}`);
  try {
    await waitFor(async () => isProcessDied(pid), { checkTime: 100, timeout: 4000 });
  } catch (err) {
    await _SIGKILL(pid, 9, times + 1);
  }
}

// 广度优先遍历进程树，将pid放入tmp
const flatProcessTree = (tree: any, tmp: any[]) => {
  if (tree.children) {
    tmp.push(...tree.children.map((item) => item.pid));
    tree.children.forEach((item) => flatProcessTree(item, tmp));
  }
  tree = null;
  (tmp as any) = null;
};

export async function SIGKILL(pid: number, signal = 2) {
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      exec(`taskkill /pid ${pid} /T /F`, resolve);
    });
  }

  let tree = await getProcessTree(pid);
  // 获取所有进程PID,从叶到根
  const tmp = [tree.pid];
  flatProcessTree(tree, tmp);
  tmp.reverse();
  tree = null;

  for (const item of tmp) {
    await _SIGKILL(item, signal);
  }
  return 'success';
}

// 子进程心跳包
export const heartbeat = () => {
  if (typeof process.send !== 'function') {
    return;
  }

  loop(async () => {
    await new Promise((resolve) => {
      (process as any).send({ type: 'beat', timestamp: new Date().valueOf() }, resolve);
    });
  }, 6000);
};

const parseAudioCard = (v: string) => {
  let card: any = /card \d/.exec(v) ?? ['card 1'];
  card = parseInt(card[0].replace('card ', ''), 10);
  let device: any = /device \d/.exec(v) ?? ['device 0'];
  device = parseInt(device[0].replace('device ', ''), 10);

  return { text: v, index: `hw:${card},${device}` };
};

export const getAudioCards = (filter = ''): Promise<{ text: string; index: string }[]> => {
  return new Promise((resolve, reject) => {
    exec(`arecord -l`, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        const arr = stdout
          .toString()
          .split('\n')
          .filter((item) => item.includes('card') && (filter ? item.includes(filter) : true))
          .map((item) => parseAudioCard(item));

        resolve(arr);
      }
    });
  });
};

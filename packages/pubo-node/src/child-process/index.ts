import { exec } from 'child_process';
import { loop, waitFor } from 'pubo-utils';

// 获取进程名称
export function getProcessName(pid): Promise<string> {
  if (process.platform === 'win32') {
    // 使用tasklist命令获取进程信息
    return new Promise((resolve, reject) => {
      exec(`tasklist /fi "PID eq ${pid}" /fo csv /nh`, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          // 解析CSV格式的输出
          const match = stdout.match(/^"(.+?)"/);
          if (match && match[1]) {
            resolve(match[1]);
          } else {
            reject('process not found');
          }
        }
      });
    });
  }
  return new Promise((resolve, reject) => {
    exec(`grep "Name:" /proc/${pid}/status`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString().split(':')[1]?.trim());
      }
    });
  });
}

// 根据端口号获取进程PID
export async function getPidByPort(port) {
  if (!port) {
    return '';
  }
  if (process.platform === 'win32') {
    return new Promise((resolve, reject) => {
      exec(`netstat -ano | findstr "${port}"`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const arr = stdout.split('\n');
        if (!arr[0]) {
          resolve('');
          return;
        }
        const tmp = arr[0].split(' ');
        const res = tmp.pop();
        resolve(res);
      });
    });
  }

  return new Promise((resolve, reject) => {
    exec(`lsof -i:${port} | awk '{print $2}'`, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        let res = stdout.split('\n')[1];
        if (res) {
          res = res.trim();
        }
        resolve(res);
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

// 获取进程 command
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
export async function isProcessDied(pid: number) {
  const used = await getProcessCpuUseByPid(pid);
  return used < 0;
}

// 获取子进程
export function getProcessByPpid(pid: number): Promise<number[]> {
  return new Promise((resolve) => {
    let child: any = exec(`ps -o pid --no-headers --ppid ${pid}`, (err, stdout) => {
      if (err) {
        resolve([]);
        child = null;
      } else {
        resolve(
          stdout
            .split('\n')
            .filter((item) => !!item)
            .map((item) => parseFloat(item.trim()))
            .filter((item) => item !== child.pid),
        );
        child = null;
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
  const pidList = await getProcessByPpid(pid);
  for (const id of pidList) {
    const item = { pid: id, children: [] };
    await getProcessTree(id, item);
    tree.children.push(item);
  }
  if (isRoot) {
    return tree;
  } else {
    tree = null;
    return null;
  }
};

// 杀死进程
async function _SIGKILL(pid, signal = 2, times = 1) {
  if (times > 5) {
    throw new Error('SIGKILL 失败. times > 5');
  }

  exec(`kill -${signal} ${pid}`);
  try {
    await waitFor(async () => isProcessDied(pid), {
      checkTime: 100,
      timeout: 4000,
    });
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

// 获取所有进程PID,从叶到根
export const getProcessList = async (pid) => {
  let tree = await getProcessTree(pid);
  const tmp: number[] = [];
  if (!tree.pid) {
    return tmp;
  }
  tmp.push(tree.pid);
  flatProcessTree(tree, tmp);
  tmp.reverse();
  tree = null;
  return tmp;
};

// 杀死进程以及子进程
export async function SIGKILL(pid: number, signal = 2, times = 1) {
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      exec(`taskkill /pid ${pid} /T /F`, resolve);
    });
  }

  const tmp = await getProcessList(pid);
  const res = { success: true, error: null };
  for (const item of tmp) {
    try {
      await _SIGKILL(item, signal, times);
    } catch (err) {
      res.error = err;
      res.success = false;
    }
  }

  return res;
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
  if (process.platform === 'win32') {
    return Promise.resolve([]);
  }
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

const dic = ['fileSystem', 'size', 'used', 'avail', 'usedPercent', 'mounted'];

const parser = (str) => {
  return str
    .split('\n')
    .filter((item) => item)
    .map((item) => item.split(' ').filter((s) => !!s))
    .map((item) => {
      const res = {};
      dic.forEach((key, i) => (res[key] = item[i]));
      return res;
    })
    .map((item) => ({
      ...item,
      total: parseFloat(item.size),
      percentage: parseFloat(item['use%']),
    }));
};

export const getDiskUsage = async () => {
  return new Promise((resolve) => {
    exec('df -h | grep G', (err, stdout) => {
      if (err) {
        resolve([]);
      } else {
        resolve(parser(stdout.toString()));
      }
    });
  });
};

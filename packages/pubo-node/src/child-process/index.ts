import { loop } from 'pubo-utils';
import { PProcess } from './p-process-type';
import { PProcessLinux } from './linux';
import { PProcessWin32 } from './win32';

const processManager: PProcess = process.platform === 'win32' ? new PProcessWin32() : new PProcessLinux();

// 获取进程名称
export function getProcessName(pid): Promise<string> {
  return processManager.getProcessName(pid);
}

// 根据端口号获取进程PID
export async function getPidByPort(port) {
  return processManager.getPidByPort(port);
}

// 获取进程 cpu 使用率
export function getProcessCpuUseByPid(pid: number): Promise<number> {
  return processManager.getProcessCpuUseByPid(pid);
}

// 获取进程 command
export function getProcessCommandByPid(pid: number): Promise<string> {
  return processManager.getProcessCommandByPid(pid);
}

// 判断进程是否死亡
export async function isProcessDied(pid: number) {
  return processManager.isProcessDied(pid);
}

// 获取子进程
export function getProcessByPpid(pid: number): Promise<number[]> {
  return processManager.getProcessByPpid(pid);
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
  return processManager.SIGKILL(pid, signal, times);
}

// 子进程心跳包
export const heartbeat = () => {
  if (typeof process.send !== 'function') {
    return;
  }

  loop(async () => {
    await new Promise((resolve: any) => {
      (process as any).send({ type: 'beat', timestamp: new Date().valueOf() }, resolve);
    });
  }, 6000);
};

export const getAudioCards = (filter = ''): Promise<{ text: string; index: string }[]> => {
  if (processManager.getAudioCards) {
    return processManager.getAudioCards(filter);
  }
  return Promise.resolve([]);
};

export const getDiskUsage = async () => {
  if (processManager.getDiskUsage) {
    return processManager.getDiskUsage();
  }
  return Promise.resolve([]);
};

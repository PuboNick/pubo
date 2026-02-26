import { loop } from 'pubo-utils';
import { PProcess } from './p-process-type';
import { PProcessLinux } from './linux';
import { PProcessWin32 } from './win32';

interface ProcessTree {
  pid: number;
  children: ProcessTree[];
}

const processManager: PProcess = process.platform === 'win32' ? new PProcessWin32() : new PProcessLinux();

// 获取进程名称
export function getProcessName(pid: number): Promise<string> {
  return processManager.getProcessName(pid);
}

// 根据端口号获取进程PID
export async function getPidByPort(port: number): Promise<number> {
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
export async function isProcessDied(pid: number): Promise<boolean> {
  return processManager.isProcessDied(pid);
}

// 获取子进程
export function getProcessByPpid(pid: number): Promise<number[]> {
  return processManager.getProcessByPpid(pid);
}

// 获取进程树
export const getProcessTree = async (pid: number, tree?: ProcessTree): Promise<ProcessTree | null> => {
  let isRoot = false;
  if (!tree) {
    isRoot = true;
    tree = { pid, children: [] };
  }
  const pidList = await getProcessByPpid(pid);
  for (const id of pidList) {
    const item: ProcessTree = { pid: id, children: [] };
    await getProcessTree(id, item);
    tree.children.push(item);
  }
  if (isRoot) {
    return tree;
  }
  return null;
};

// 广度优先遍历进程树，将pid放入tmp
const flatProcessTree = (tree: ProcessTree, tmp: number[]): void => {
  if (tree.children) {
    tmp.push(...tree.children.map((item) => item.pid));
    tree.children.forEach((item) => flatProcessTree(item, tmp));
  }
};

// 获取所有进程PID,从叶到根
export const getProcessList = async (pid: number): Promise<number[]> => {
  const tree = await getProcessTree(pid);
  const tmp: number[] = [];
  if (!tree?.pid) {
    return tmp;
  }
  tmp.push(tree.pid);
  flatProcessTree(tree, tmp);
  tmp.reverse();
  return tmp;
};

// 杀死进程以及子进程
export async function SIGKILL(pid: number, signal = 2, times = 1): Promise<{ success: boolean; error: string }> {
  return processManager.SIGKILL(pid, signal, times);
}

// 子进程心跳包
export const heartbeat = (): void => {
  if (typeof process.send !== 'function') {
    return;
  }

  loop(async () => {
    await new Promise<void>((resolve) => {
      process.send!({ type: 'beat', timestamp: Date.now() }, resolve);
    });
  }, 6000);
};

export const getAudioCards = (filter = ''): Promise<{ text: string; index: string }[]> => {
  if (processManager.getAudioCards) {
    return processManager.getAudioCards(filter);
  }
  return Promise.resolve([]);
};

export const getDiskUsage = async (): Promise<unknown[]> => {
  if (processManager.getDiskUsage) {
    return processManager.getDiskUsage();
  }
  return Promise.resolve([]);
};

export interface PidTree {
  pid: number;
  children: PidTree;
}

export interface DiskInfo {
  fileSystem: string;
  size: number;
  used: number;
  avail: number;
  usedPercent: number;
  mounted: number;
}

export interface PProcess {
  getProcessName(pid: number): Promise<string>;
  getPidByPort(port: number): Promise<number>;
  getProcessCpuUseByPid(pid: number): Promise<number>;
  getProcessCommandByPid(pid: number): Promise<string>;
  isProcessDied(pid: number): Promise<boolean>;
  getProcessByPpid(ppid: number): Promise<number[]>;
  SIGKILL(pid: number): Promise<{ success: boolean; error: string }>;
}

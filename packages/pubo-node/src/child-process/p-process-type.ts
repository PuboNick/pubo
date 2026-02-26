export interface PidTree {
  pid: number;
  children: PidTree[];
}

export interface DiskInfo {
  fileSystem: string;
  size: number;
  used: number;
  avail: number;
  usedPercent: number;
  mounted: string;
  total?: number;
  percentage?: number;
}

export interface PProcess {
  getProcessName(pid: number): Promise<string>;
  getPidByPort(port: number): Promise<number>;
  getProcessCpuUseByPid(pid: number): Promise<number>;
  getProcessCommandByPid(pid: number): Promise<string>;
  isProcessDied(pid: number): Promise<boolean>;
  getProcessByPpid(ppid: number): Promise<number[]>;
  SIGKILL(pid: number, signal?: number, times?: number): Promise<{ success: boolean; error: string }>;
  getDiskUsage?(): Promise<DiskInfo[]>;
  getAudioCards?(filter?: string): Promise<{ text: string; index: string }[]>;
}

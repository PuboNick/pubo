import { exec } from 'child_process';
import { PProcess, DiskInfo } from './p-process-type';

export class PProcessWin32 implements PProcess {
  getProcessName(pid: number): Promise<string> {
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
            reject(new Error('process not found'));
          }
        }
      });
    });
  }

  getPidByPort(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      exec(`netstat -ano | findstr "${port}"`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const arr = stdout.split('\n');
        if (!arr[0]) {
          reject(new Error('process not found'));
          return;
        }
        const tmp = arr[0].split(' ');
        const res = tmp.pop();
        const pid = parseInt(res ?? '', 10);
        if (isNaN(pid)) {
          reject(new Error('process not found'));
          return;
        }
        resolve(pid);
      });
    });
  }

  async getProcessCpuUseByPid(pid: number): Promise<number> {
    return new Promise((resolve, reject) => {
      exec(
        `wmic path Win32_PerfFormattedData_PerfProc_Process get IDProcess,PercentProcessorTime | findstr "${pid}"`,
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          const match = stdout.match(/\d+\s+(\d+)/);
          if (!match) {
            reject(new Error('Process not found'));
            return;
          }
          resolve(parseInt(match[1], 10));
        },
      );
    });
  }

  async getProcessCommandByPid(pid: number): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`wmic process where "ProcessId=${pid}" get CommandLine /value`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const match = stdout.match(/CommandLine=(.*)/);
        if (!match) {
          reject(new Error('Process not found'));
          return;
        }
        resolve(match[1].trim());
      });
    });
  }

  async isProcessDied(pid: number): Promise<boolean> {
    const used = await this.getProcessCpuUseByPid(pid);
    return used < 0;
  }

  async getProcessByPpid(ppid: number): Promise<number[]> {
    return new Promise((resolve, reject) => {
      exec(`wmic process where "ParentProcessId=${ppid}" get ProcessId /value`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const pids: number[] = [];
        const lines = stdout.split('\n');

        for (const line of lines) {
          const match = line.match(/ProcessId=(\d+)/);
          if (match) {
            const pid = parseInt(match[1], 10);
            if (!isNaN(pid)) {
              pids.push(pid);
            }
          }
        }

        resolve(pids);
      });
    });
  }

  async SIGKILL(pid: number): Promise<{ success: boolean; error: string }> {
    return new Promise((resolve) => {
      exec(`taskkill /pid ${pid} /T /F`, (err) => {
        resolve({ success: true, error: err?.toString() ?? '' });
      });
    });
  }

  async getDiskUsage(): Promise<DiskInfo[]> {
    return new Promise((resolve) => {
      exec('wmic logicaldisk get Caption,FreeSpace,Size /format:csv', (err, stdout) => {
        if (err) {
          resolve([]);
          return;
        }
        const lines = stdout.split('\r\n').filter((line) => line.trim() !== '');
        const disks = lines
          .map((line) => {
            const parts = line.split(',').map((s) => s.trim());
            if (parts.length < 4) return null;
            if (parts[1] === 'Caption') return null;

            const caption = parts[1];
            const freeSpace = parseInt(parts[2], 10);
            const size = parseInt(parts[3], 10);

            if (isNaN(size) || isNaN(freeSpace)) return null;

            const used = size - freeSpace;
            const usedPercent = size > 0 ? (used / size) * 100 : 0;

            return {
              fileSystem: caption,
              size,
              used,
              avail: freeSpace,
              usedPercent: usedPercent,
              mounted: caption,
              total: size,
              percentage: Math.round(usedPercent),
            };
          })
          .filter((item) => item !== null);
        resolve(disks);
      });
    });
  }

  getAudioCards(): Promise<{ text: string; index: string }[]> {
    return Promise.resolve([]);
  }
}

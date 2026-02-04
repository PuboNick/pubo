import { exec } from 'child_process';
import { PProcess } from './p-process-type';

export class PProcessWin32 implements PProcess {
  getProcessName(pid): Promise<string> {
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

  getPidByPort(port): Promise<number> {
    return new Promise((resolve, reject) => {
      exec(`netstat -ano | findstr "${port}"`, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const arr = stdout.split('\n');
        if (!arr[0]) {
          reject('process not found');
          return;
        }
        const tmp = arr[0].split(' ');
        let res: any = tmp.pop();
        res = parseInt(res);
        if (isNaN(res)) {
          reject('process not found');
          return;
        }
        resolve(res);
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
            reject('Process not found');
            return;
          }
          resolve(parseInt(match[1]));
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
          reject('Process not found');
          return;
        }
        resolve(match[1].trim());
      });
    });
  }

  async isProcessDied(pid: number) {
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
            const pid = parseInt(match[1]);
            if (!isNaN(pid)) {
              pids.push(pid);
            }
          }
        }

        resolve(pids);
      });
    });
  }

  async SIGKILL(pid: number, signal?: number, times?: number): Promise<{ success: boolean; error: string }> {
    return new Promise((resolve) => {
      exec(`taskkill /pid ${pid} /T /F`, (err: any) => {
        resolve({ success: true, error: err.toString() });
      });
    });
  }

  async getDiskUsage() {
    return new Promise<any>((resolve) => {
      exec('wmic logicaldisk get Caption,FreeSpace,Size /format:csv', (err, stdout) => {
        if (err) {
          resolve([]);
          return;
        }
        const lines = stdout.split('\r\n').filter((line) => line.trim() !== '');
        // format:csv output has a header line "Node,Caption,FreeSpace,Size" usually.
        // It might also have empty lines.
        const disks = lines
          .map((line) => {
            // CSV parsing: simple split by comma
            const parts = line.split(',').map((s) => s.trim());
            if (parts.length < 4) return null; // Node, Caption, FreeSpace, Size
            // Header check
            if (parts[1] === 'Caption') return null;

            const caption = parts[1];
            const freeSpace = parseInt(parts[2]);
            const size = parseInt(parts[3]);

            if (isNaN(size) || isNaN(freeSpace)) return null;

            const used = size - freeSpace;
            const usedPercent = size > 0 ? (used / size) * 100 : 0;

            return {
              fileSystem: caption,
              size: size, // bytes
              used: used,
              avail: freeSpace,
              usedPercent: `${usedPercent.toFixed(0)}%`,
              mounted: caption,
              total: size,
              percentage: parseFloat(usedPercent.toFixed(0)),
            };
          })
          .filter((item) => item);
        resolve(disks);
      });
    });
  }

  getAudioCards() {
    return Promise.resolve([]);
  }
}

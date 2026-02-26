import { exec } from 'child_process';
import { PProcess, DiskInfo } from './p-process-type';
import { waitFor } from 'pubo-utils';
import { getProcessList } from '.';

export class PProcessLinux implements PProcess {
  private async _SIGKILL(pid: number, signal = 2, times = 1): Promise<void> {
    if (times > 5) {
      throw new Error('SIGKILL 失败. times > 5');
    }

    exec(`kill -${signal} ${pid}`);
    try {
      await waitFor(async () => this.isProcessDied(pid), {
        checkTime: 100,
        timeout: 4000,
      });
    } catch {
      await this._SIGKILL(pid, 9, times + 1);
    }
  }

  getProcessName(pid: number): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`grep "Name:" /proc/${pid}/status`, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.toString().split(':')[1]?.trim() ?? '');
        }
      });
    });
  }

  getPidByPort(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      exec(`lsof -i:${port} | awk '{print $2}'`, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          const res = stdout.split('\n')[1]?.trim();
          const pid = parseInt(res ?? '', 10);
          if (isNaN(pid)) {
            reject(new Error('process not found'));
            return;
          }
          resolve(pid);
        }
      });
    });
  }

  getProcessCpuUseByPid(pid: number): Promise<number> {
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

  getProcessCommandByPid(pid: number): Promise<string> {
    return new Promise((resolve) => {
      exec(`ps -p ${pid} -o command=`, (err, stdout) => {
        if (err) {
          resolve('');
        } else {
          resolve(stdout.toString().split('\n')[0] ?? '');
        }
      });
    });
  }

  async isProcessDied(pid: number): Promise<boolean> {
    const used = await this.getProcessCpuUseByPid(pid);
    return used < 0;
  }

  getProcessByPpid(pid: number): Promise<number[]> {
    return new Promise((resolve) => {
      exec(`ps -o pid --no-headers --ppid ${pid}`, (err, stdout) => {
        if (err) {
          resolve([]);
        } else {
          const pidList = stdout
            .split('\n')
            .filter((item) => !!item)
            .map((item) => parseFloat(item.trim()))
            .filter((item) => !isNaN(item));
          resolve(pidList);
        }
      });
    });
  }

  async SIGKILL(pid: number, signal = 2, times = 1): Promise<{ success: boolean; error: string }> {
    const tmp = await getProcessList(pid);
    const res: { success: boolean; error: string } = { success: true, error: '' };
    for (const item of tmp) {
      try {
        await this._SIGKILL(item, signal, times);
      } catch (err) {
        res.error = String(err);
        res.success = false;
      }
    }

    return res;
  }

  async getDiskUsage(): Promise<DiskInfo[]> {
    return new Promise((resolve) => {
      exec('df -h | grep G', (err, stdout) => {
        if (err) {
          resolve([]);
        } else {
          resolve(parseDiskUsage(stdout.toString()));
        }
      });
    });
  }

  getAudioCards(filter = ''): Promise<{ text: string; index: string }[]> {
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
  }
}

const parseAudioCard = (v: string): { text: string; index: string } => {
  const cardMatch = /card (\d+)/.exec(v) ?? ['card 1', '1'];
  const deviceMatch = /device (\d+)/.exec(v) ?? ['device 0', '0'];
  const card = parseInt(cardMatch[1], 10);
  const device = parseInt(deviceMatch[1], 10);

  return { text: v, index: `hw:${card},${device}` };
};

interface DiskUsageRaw {
  fileSystem: string;
  size: string;
  used: string;
  avail: string;
  usePercent: string;
  mounted: string;
}

const parseDiskUsage = (str: string): DiskInfo[] => {
  const keys = ['fileSystem', 'size', 'used', 'avail', 'usePercent', 'mounted'];
  return str
    .split('\n')
    .filter((item) => item)
    .map((item) => {
      const values = item.split(' ').filter((s) => !!s);
      const raw: DiskUsageRaw = {
        fileSystem: values[0] ?? '',
        size: values[1] ?? '',
        used: values[2] ?? '',
        avail: values[3] ?? '',
        usePercent: values[4] ?? '',
        mounted: values[5] ?? '',
      };
      return {
        fileSystem: raw.fileSystem,
        size: parseFloat(raw.size),
        used: parseFloat(raw.used),
        avail: parseFloat(raw.avail),
        usedPercent: parseFloat(raw.usePercent.replace('%', '')),
        mounted: raw.mounted,
        total: parseFloat(raw.size),
        percentage: parseFloat(raw.usePercent.replace('%', '')),
      };
    });
};

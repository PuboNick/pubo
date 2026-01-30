import { exec } from 'child_process';
import { PProcess } from './p-process-type';
import { waitFor } from 'pubo-utils';
import { getProcessList } from '.';

export class PProcessLinux implements PProcess {
  private async _SIGKILL(pid, signal = 2, times = 1) {
    if (times > 5) {
      throw new Error('SIGKILL 失败. times > 5');
    }

    exec(`kill -${signal} ${pid}`);
    try {
      await waitFor(async () => this.isProcessDied(pid), {
        checkTime: 100,
        timeout: 4000,
      });
    } catch (err) {
      await this._SIGKILL(pid, 9, times + 1);
    }
  }

  getProcessName(pid): Promise<string> {
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

  getPidByPort(port): Promise<number> {
    return new Promise((resolve, reject) => {
      exec(`lsof -i:${port} | awk '{print $2}'`, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          let res: any = stdout.split('\n')[1];
          if (res) {
            res = res.trim();
          }
          res = parseInt(res);
          if (isNaN(res)) {
            reject('process not found');
            return;
          }
          resolve(res);
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
          resolve(stdout.toString().split('\n')[0]);
        }
      });
    });
  }

  async isProcessDied(pid: number) {
    const used = await this.getProcessCpuUseByPid(pid);
    return used < 0;
  }

  getProcessByPpid(pid: number): Promise<number[]> {
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

  async SIGKILL(pid: number, signal = 2, times = 1): Promise<{ success: boolean; error: string }> {
    const tmp = await getProcessList(pid);
    const res: any = { success: true, error: '' };
    for (const item of tmp) {
      try {
        await this._SIGKILL(item, signal, times);
      } catch (err) {
        res.error = err;
        res.success = false;
      }
    }

    return res;
  }

  async getDiskUsage() {
    return new Promise<any>((resolve) => {
      exec('df -h | grep G', (err, stdout) => {
        if (err) {
          resolve([]);
        } else {
          resolve(parser(stdout.toString()));
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

const parseAudioCard = (v: string) => {
  let card: any = /card \d/.exec(v) ?? ['card 1'];
  card = parseInt(card[0].replace('card ', ''), 10);
  let device: any = /device \d/.exec(v) ?? ['device 0'];
  device = parseInt(device[0].replace('device ', ''), 10);

  return { text: v, index: `hw:${card},${device}` };
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

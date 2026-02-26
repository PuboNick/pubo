import { exec } from 'child_process';

interface NetworkInfo {
  description?: string;
  'logical name'?: string;
  [key: string]: string | undefined;
}

function parseNetworkData(data: Buffer): NetworkInfo[] {
  return data
    .toString()
    .replace(/\*-network.*\n/g, '-----')
    .split('-----')
    .filter((item) => item.trim())
    .map((item) => {
      const res: NetworkInfo = {};
      const tmp = item.split('\n');
      tmp.forEach((i) => {
        const arr = i.split(':').map((key) => key.trim());
        if (arr[0] && arr[1]) {
          res[arr[0]] = arr[1];
        }
      });
      return res;
    });
}

export async function getNetworks(): Promise<NetworkInfo[]> {
  return new Promise((resolve) => {
    const child = exec('lshw -C network');
    child.stdout?.on('data', (data: Buffer) => {
      resolve(parseNetworkData(data));
    });
    child.on('error', () => {
      resolve([]);
    });
  });
}

export async function getWifiName(): Promise<string> {
  const networks = await getNetworks();
  const wifi = networks.find((item) => item.description === 'Wireless interface');
  if (!wifi) {
    return '';
  }
  return wifi['logical name'] ?? '';
}

import { exec } from 'child_process';

function parseNetworkData(data) {
  return data
    .toString()
    .replace(/\*-network.*\n/g, '-----')
    .split('-----')
    .filter((item) => item.trim())
    .map((item) => {
      const res: any = {};
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

export async function getNetworks(): Promise<any[]> {
  return new Promise((resolve) => {
    const child = exec('lshw -C network');
    child.stdout?.on('data', (data) => {
      resolve(parseNetworkData(data));
    });
  });
}

export async function getWifiName() {
  const networks = await getNetworks();
  const wifi = networks.find((item) => item.description === 'Wireless interface');
  if (!wifi) {
    return '';
  }
  return wifi['logical name'];
}

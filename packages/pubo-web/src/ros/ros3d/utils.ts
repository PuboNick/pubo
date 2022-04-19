import ROSLIB from 'roslib';
import { loadScript } from '../../load-script';

export function getRainbowColor(pct: number) {
  const h = (1 - pct) * 5.0 + 1.0;
  let i = Math.floor(h);
  let f = h % 1.0;
  if ((i & 1) === 0) {
    f = 1 - f;
  }
  const n = 1 - f;
  const dic = [
    { r: n, g: 0, b: 1 },
    { r: 0, g: n, b: 1 },
    { r: 0, g: 1, b: n },
    { r: n, g: 1, b: 0 },
    { r: 1, g: n, b: 0 },
  ];
  if (i < 1) {
    i = 1;
  }
  const temp: any = dic[i - 1] || dic[4];
  Object.keys(temp).forEach((key) => (temp[key] = temp[key] * 255));
  return { ...temp, a: 1 };
}

export function colormap(x: number) {
  const minColorValue = 0;
  const maxColorValue = 512 * 512 * 512;
  const colorFieldRange = maxColorValue - minColorValue || Infinity;
  const pct = Math.max(
    0,
    Math.min((Math.pow(x, 4) - minColorValue) / colorFieldRange, 1),
  );
  return getRainbowColor(pct);
}

export async function loadLib(url: string) {
  if (!(window as any).ROSLIB) {
    (window as any).ROSLIB = ROSLIB;
  }
  if ((window as any).ROS3D) {
    return (window as any).ROS3D;
  }
  await loadScript(url);
  return (window as any).ROS3D;
}

export const basePointCloudOptions = {
  colorsrc: 'intensity',
  material: { size: 0.1 },
  max_pts: 10000000,
  colormap,
};

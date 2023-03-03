const str2int = (str) => parseInt(str.replace('#', ''), 16);

export const hex2rgb = (n: number | string): [number, number, number] => {
  let v: number;
  if (typeof n === 'string') {
    v = str2int(n);
  } else {
    v = n;
  }
  const str = v.toString(2).padStart(24, '0');
  const r = parseInt(str.slice(0, 8), 2);
  const g = parseInt(str.slice(8, 16), 2);
  const b = parseInt(str.slice(16, 24), 2);
  return [r, g, b];
};

export const rgb2hex = (color: [number, number, number] | [number, number, number, number]): string => {
  return '#' + [0, 1, 2].map((i) => color[i].toString(16)).join('');
};

export class ColorUtils {
  int: number;

  constructor(n: number | string | [number, number, number]) {
    if (typeof n === 'number') {
      this.int = n;
    } else if (typeof n === 'string') {
      this.int = str2int(n);
    } else if (Array.isArray(n)) {
      this.int = str2int(rgb2hex(n));
    }
  }

  public getRgbArray() {
    return hex2rgb(this.int);
  }

  public get rgb() {
    return `rba(${this.getRgbArray().join(', ')})`;
  }

  public get hex() {
    return rgb2hex(this.getRgbArray());
  }

  public toString(type = 'hex') {
    if (type === 'rgb') {
      return this.rgb;
    }
    return this.hex;
  }
}

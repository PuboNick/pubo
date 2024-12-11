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

export class LinearColor {
  private readonly base = [255, 0, 0];
  private intensity = 1;
  private readonly min: number;
  private readonly max: number;

  constructor({ base = [255, 0, 0], intensity = 1 }: { base?: [number, number, number]; intensity?: number } = {}) {
    this.base = base;
    this.intensity = intensity;
    if (this.intensity < 1) {
      this.intensity = 1;
    }
    this.min = this.base[1];
    this.max = this.base[0];

    if (Math.abs(this.min - this.max) < 1) {
      this.min = 0;
      this.max = 255;
    }
  }

  getColor(value: number) {
    if (value < 0) {
      return this.base;
    }

    let r = this.base[0];
    let g = this.base[1];
    let b = this.base[2];

    let n = value * this.intensity;
    g = this.base[1] + n;
    if (g < this.max) {
      return [r, g, b];
    }
    n = g - this.max;
    g = this.max;
    r = this.base[0] - n;
    if (r > this.min) {
      return [r, g, b];
    }
    n = this.min - r;
    r = this.min;
    b = this.base[2] + n;
    if (b < this.max) {
      return [r, g, b];
    }
    n = b - this.max;
    b = this.max;
    g = g - n;
    if (g > this.min) {
      return [r, g, b];
    }
    n = this.min - g;
    g = this.min;
    r = r + n;
    if (r < this.max) {
      return [r, g, b];
    }
    n = r - this.max;
    r = this.max;
    b = b - n;
    if (b > this.min) {
      return [r, g, b];
    }
    b = this.min;
    return [r, g, b];
  }
}

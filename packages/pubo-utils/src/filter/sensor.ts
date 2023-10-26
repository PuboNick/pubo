// 过滤跳变数据
export class SensorDataFilter {
  // 缓冲区
  private readonly tmp: number[] = [];
  // 最大缓存
  private readonly size: number;
  // 跳变步长
  private readonly step: number;
  // 最小值
  private readonly min: number;
  // 最大值
  private readonly max: number;

  // 与缓冲区不一致的值连续出现的次数 (不一致指的是与缓冲区中数量最多的数值不同且差值大于步长)
  private count = 0;
  // 与缓冲区不一致的值
  private value = NaN;
  // 上一次正确返回的值
  private old: number;

  constructor({
    size = 5,
    step = 5,
    min = -Infinity,
    max = Infinity,
  }: { size?: number; step?: number; max?: number; min?: number } = {}) {
    this.size = size;
    this.step = step;
    this.min = min;
    this.max = max;
  }

  filter(n: number) {
    // 溢出范围的值将被忽略
    if (n < this.min || n > this.max) {
      return this.old;
    }

    this.tmp.push(n);
    this.old = this.calc(n);
    return this.old;
  }

  private calc(n) {
    // 缓冲区没有值时直接返回当前值
    if (this.tmp.length < 1) {
      return n;
    }

    if (this.tmp.length > this.size) {
      this.tmp.shift();
    }

    const { res, dic } = this.getMostNumberOfTmp();

    // 当前值与缓冲区数量最多的值不一致且差值大于步长
    if (res !== n && Math.abs(res - n) > this.step) {
      // 累计跳变数据连续出现的次数
      if (this.value !== n) {
        this.count = 1;
      } else {
        this.count += 1;
      }

      this.value = n;

      // 跳变数据出现次数已经大于缓冲区最多的数量，表示数据确实已经改变
      if (this.count > dic[res]) {
        this.tmp.length = 0;
        this.tmp.push(n);
        return n;
      }
    } else {
      // 清除跳变数据缓存
      this.count = 0;
      this.value = NaN;
      return n;
    }

    return res;
  }

  private getMostNumberOfTmp() {
    const a = {};
    let max = 0;
    let res;
    for (const item of this.tmp) {
      if (!a[item]) {
        a[item] = 1;
      } else {
        a[item] += 1;
      }

      if (a[item] > max) {
        max = a[item];
        res = item;
      }
    }
    return { res, dic: a };
  }
}

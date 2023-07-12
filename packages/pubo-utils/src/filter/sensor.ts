/**
 * @description 过滤传感器类型的跳变数据
 */
export class SensorDataFilter {
  private readonly size: number = 5;
  private readonly cache = { last: { count: 0, value: 0 }, current: { value: 0, count: 0 } };

  constructor({ size = 5 }: { size?: number } = {}) {
    this.size = size;
  }

  filter(n: number) {
    if (this.cache.current.count < 1) {
      this.cache.current.value = n;
      this.cache.current.count = 1;
      return n;
    }

    this.updateLast(n);

    if (this.cache.current.value !== n) {
      if (this.cache.last.count > this.cache.current.count || this.cache.last.count > this.size) {
        this.cache.current.value = n;
        this.cache.current.count = 1;
      }
    } else {
      this.cache.current.count += 1;
    }

    return this.cache.current.value;
  }

  private updateLast(n: number) {
    if (this.cache.last.value !== n) {
      this.cache.last.count = 1;
    } else {
      this.cache.last.count += 1;
    }
    this.cache.last.value = n;
  }
}

export class BufferSplit {
  private cache = Buffer.alloc(0);
  private c: Buffer;

  constructor(buf: Buffer) {
    this.c = buf;
  }

  push(buf: Buffer) {
    // @ts-ignore
    const tmp = Buffer.concat([this.cache, buf]);
    const arr: Buffer[] = [];
    let n = 0;

    for (let i = this.cache.byteLength; i <= tmp.byteLength - this.c.byteLength; i += 1) {
      // @ts-ignore
      const bool = this.c.equals(tmp.subarray(i, this.c.byteLength + i));
      if (bool) {
        const res = tmp.subarray(n, i);
        arr.push(res);
        n = this.c.byteLength + i;
        i = this.c.byteLength + i;
      }
    }

    this.cache = tmp.subarray(n);
    return arr;
  }
}

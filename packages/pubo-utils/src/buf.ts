export class BufferSplit {
  private cache = Buffer.alloc(0);
  private readonly delimiter: Buffer;

  constructor(delimiter: Buffer) {
    this.delimiter = delimiter;
  }

  push(buf: Buffer): Buffer[] {
    const tmp = Buffer.concat([this.cache, buf]);
    const arr: Buffer[] = [];
    let n = 0;

    for (let i = this.cache.byteLength; i <= tmp.byteLength - this.delimiter.byteLength; i += 1) {
      const isMatch = this.delimiter.equals(tmp.subarray(i, this.delimiter.byteLength + i));
      if (isMatch) {
        arr.push(tmp.subarray(n, i));
        n = this.delimiter.byteLength + i;
        i = this.delimiter.byteLength + i - 1; // -1 因为循环会 +1
      }
    }

    this.cache = tmp.subarray(n);
    return arr;
  }
}

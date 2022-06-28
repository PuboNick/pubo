export class HistoryStack<T> {
  private readonly stack: T[] = [];
  private readonly len: number = 10;
  private point = -1;

  constructor(len = 10) {
    this.len = len;
  }

  private get current() {
    if (this.point < this.stack.length && this.point > -1) {
      return this.stack[this.point];
    }
    return undefined;
  }

  push(item: T) {
    if (this.point > -1) {
      this.stack.splice(0, this.point + 1);
      this.point = -1;
    }
    this.stack.unshift(item);
    if (this.stack.length > this.len) {
      this.stack.pop();
    }
  }

  back(): T | undefined {
    if (this.point < this.stack.length - 1) {
      this.point += 1;
    }
    return this.current;
  }

  forward(): T | undefined {
    if (this.point > 0) {
      this.point -= 1;
    }
    return this.current;
  }
}

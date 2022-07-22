export class HistoryStack<T> {
  private readonly stack: T[] = [];
  private readonly len: number = 10;
  private point = 0;

  constructor(len = 10) {
    this.len = len;
  }

  private get current() {
    if (this.point < this.stack.length && this.point > -1) {
      return this.stack[this.point];
    }
    return undefined;
  }

  clear() {
    this.stack.length = 0;
    this.point = 0;
  }

  backup(item: T) {
    if (this.point > 0 && this.stack.length > 0) {
      this.stack.splice(0, this.point + 2);
      this.point = 0;
    }
    this.stack.unshift(item);
    if (this.stack.length > this.len) {
      this.stack.pop();
    }
  }

  undo(): T | undefined {
    if (this.point < this.stack.length - 1) {
      this.point += 1;
    }
    return this.current;
  }

  redo(): T | undefined {
    if (this.point > 0) {
      this.point -= 1;
    }
    return this.current;
  }
}

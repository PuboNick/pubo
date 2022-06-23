export class Stack<T> {
  private readonly stack: T[] = [];
  private readonly len: number = 10;

  constructor(len = 10) {
    this.len = len;
  }

  unshift(item: T) {
    this.stack.unshift(item);
    if (this.stack.length > this.len) {
      this.stack.pop();
    }
  }

  shift(): T | undefined {
    return this.stack.shift();
  }
}

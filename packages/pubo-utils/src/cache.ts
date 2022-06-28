export class Cache<T> {
  private _: T;
  constructor(props: T) {
    this._ = props;
  }
  get() {
    return this._;
  }
  set(data: T) {
    this._ = data;
  }
}

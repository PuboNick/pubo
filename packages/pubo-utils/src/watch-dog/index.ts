export default class WatchDog {
  count = 0;
  limit = 1;

  constructor({ limit = 1, onError }) {
    this.limit = limit;
    this.onError = onError;
  }

  init() {
    setInterval(() => this.onTimer(), 1000);
  }

  feed() {
    this.count = 0;
  }

  onError() {}

  onTimer() {
    if (this.count > this.limit && typeof this.onError === 'function') {
      this.onError();
      this.count = 0;
    } else {
      this.count++;
    }
  }
}

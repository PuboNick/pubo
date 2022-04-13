export class WatchDog {
  count = 0;
  limit = 1;
  i: any = null;

  constructor({ limit = 1, onTimeout }: { limit: number; onTimeout: () => void }) {
    this.limit = limit;
    this.onTimeout = onTimeout;
  }

  onTimeout() {
    console.log('timeout!');
  }

  init() {
    this.i = setInterval(() => this.onTimer(), 1000);
  }

  feed() {
    this.count = 0;
  }

  onTimer() {
    if (this.count > this.limit && typeof this.onTimeout === 'function') {
      this.onTimeout();
      this.count = 0;
    } else {
      this.count++;
    }
  }

  stop() {
    if (this.i) {
      clearInterval(this.i);
    }
  }
}

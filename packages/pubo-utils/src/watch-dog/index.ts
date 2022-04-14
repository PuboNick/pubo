export class WatchDog {
  private count = 0;
  private readonly limit;
  private i: any = null;

  constructor({ limit = 1, onTimeout }: { limit: number; onTimeout: () => void }) {
    this.limit = limit;
    this.onTimeout = onTimeout;
  }

  private onTimeout() {
    console.log('timeout!');
  }

  private onTimer() {
    if (this.count > this.limit && typeof this.onTimeout === 'function') {
      this.onTimeout();
      this.count = 0;
    } else {
      this.count++;
    }
  }

  init() {
    this.i = setInterval(() => this.onTimer(), 1000);
  }

  feed() {
    this.count = 0;
  }

  stop() {
    if (this.i) {
      clearInterval(this.i);
      this.count = 0;
    }
  }
}

interface WatchDogProps {
  limit: number;
  onTimeout: () => void | Promise<void>;
}

export class WatchDog {
  private readonly limit: number = 10;
  private readonly onTimeout: () => void;
  private timeout: any = null;

  constructor({ limit = 10, onTimeout }: WatchDogProps) {
    this.limit = limit;
    this.onTimeout = onTimeout;
  }

  feed() {
    this.init();
  }

  init() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.onTimeout(), this.limit * 1000);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

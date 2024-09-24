interface WatchDogProps {
  limit: number;
  onTimeout: () => void | Promise<void>;
}

export class WatchDog {
  private readonly onTimeout: () => void;
  private timeout: any = null;
  private readonly _time: number;

  constructor({ limit = 10, onTimeout }: WatchDogProps) {
    this._time = limit * 1000;

    this.onTimeout = () => {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      onTimeout();
    };
  }

  feed() {
    this.init();
  }

  init() {
    clearTimeout(this.timeout);
    this.timeout = null;
    delete this.timeout;

    this.timeout = setTimeout(this.onTimeout, this._time);
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    delete this.timeout;
  }
}

interface WatchDogProps {
  limit: number;
  onTimeout: () => void | Promise<void>;
}

export class WatchDog {
  private readonly onTimeout: () => void;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private readonly _time: number;

  constructor({ limit = 10, onTimeout }: WatchDogProps) {
    this._time = limit * 1000;
    this.onTimeout = () => {
      this.stop();
      onTimeout();
    };
  }

  feed(): void {
    this.init();
  }

  init(): void {
    this.stop();
    this.timeout = setTimeout(this.onTimeout, this._time);
  }

  stop(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

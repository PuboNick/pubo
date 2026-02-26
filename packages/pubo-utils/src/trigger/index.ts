interface ContinuousTriggerProps {
  resetTime: number;
  count: number;
  cb: () => void;
}

export class ContinuousTrigger {
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private _count = 0;
  private readonly props: ContinuousTriggerProps;

  constructor(props: ContinuousTriggerProps) {
    this.props = props;
  }

  get count(): number {
    return this._count;
  }

  increment(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => this.clear(), this.props.resetTime);

    this._count += 1;
    if (this._count >= this.props.count) {
      this.props.cb();
    }
  }

  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this._count = 0;
  }
}

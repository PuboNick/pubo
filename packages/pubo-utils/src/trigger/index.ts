interface ContinuousTriggerProps {
  resetTime: number;
  count: number;
  cb: () => void;
}

export class ContinuousTrigger {
  private timeout: any;
  private _count = 0;
  private readonly props: ContinuousTriggerProps;

  constructor(props: ContinuousTriggerProps) {
    this.props = props;
  }

  get count() {
    return this._count;
  }

  increment() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.clear(), this.props.resetTime);

    this._count = this._count + 1;
    if (this._count > this.props.count) {
      this.props.cb();
    }
  }

  clear() {
    clearTimeout(this.timeout);
    this._count = 0;
    this.timeout = 0;
  }
}

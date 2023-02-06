export interface LevelProps {
  max: number;
  min: number;
  count: number;
}

export class Level {
  private readonly config: LevelProps;
  private readonly step: number;

  constructor(props: LevelProps) {
    this.config = props;
    this.step = (this.config.max - this.config.min) / (this.config.count - 2);
  }

  get(value: number) {
    if (value <= this.config.min) {
      return 1;
    }
    if (value >= this.config.max) {
      return this.config.count;
    }
    for (let i = 2, v = this.config.min + this.step; v < this.config.max + this.step; v += this.step, i += 1) {
      if (value < v) {
        return i;
      }
    }
    return this.config.count;
  }
}

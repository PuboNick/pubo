interface LevelProps {
  max: number;
  min: number;
  count: number;
}

export class Level {
  private readonly config: LevelProps;

  constructor(props: LevelProps) {
    this.config = props;
  }

  get(value: number) {
    const step = (this.config.max - this.config.min) / (this.config.count - 1);
    for (let i = 1, v = this.config.min + step; v < this.config.max + step; v += step, i += 1) {
      if (value < v) {
        return i;
      }
    }
    return this.config.count;
  }
}

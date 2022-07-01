import { throttle } from 'pubo-utils';

type OnMove = (n: { offsetX: number; offsetY: number; key?: string }) => void;
type OnMoveEnd = () => void;

interface DragMethodProps {
  key?: string;
  onMove?: OnMove;
  onMoveEnd?: OnMoveEnd;
}

export class DragMethod {
  private readonly key?: string = '';
  private readonly cache = { pageX: 0, pageY: 0 };

  private readonly onMouseMove;
  private readonly onMouseUp;
  public readonly onMouseDown;
  public onMove?: OnMove;
  public onMoveEnd?: OnMoveEnd;

  constructor({ key = '', onMove, onMoveEnd }: DragMethodProps = {}) {
    this.key = key;
    this.onMouseDown = this._onMouseDown.bind(this);
    this.onMouseMove = throttle(this._onMouseMove.bind(this), 1000 / 100);
    this.onMouseUp = this._onMouseUp.bind(this);
    this.onMove = onMove;
    this.onMoveEnd = onMoveEnd;
  }

  private _onMouseMove(e: any) {
    if (typeof this.onMove !== 'function') {
      return;
    }

    this.onMove({
      offsetX: e.pageX - this.cache.pageX,
      offsetY: e.pageY - this.cache.pageY,
      key: this.key,
    });
    this.cache.pageX = e.pageX;
    this.cache.pageY = e.pageY;
  }

  private _onMouseUp() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    if (typeof this.onMoveEnd === 'function') {
      this.onMoveEnd();
    }
  }

  private _onMouseDown(e: any) {
    if (typeof this.onMove !== 'function') {
      return;
    }
    this.cache.pageX = e.pageX;
    this.cache.pageY = e.pageY;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }
}

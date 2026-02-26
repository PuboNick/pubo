interface DragEvent {
  offsetX: number;
  offsetY: number;
  key?: string;
  pageX: number;
  pageY: number;
  startX: number;
  startY: number;
}

type OnMove = (event: DragEvent) => void;
type OnMoveEnd = () => void;

interface DragMethodProps {
  key?: string;
  onMove?: OnMove;
  onMoveEnd?: OnMoveEnd;
}

interface CacheState {
  pageX: number;
  pageY: number;
  dragging: boolean;
}

type MouseEventHandler = (e: MouseEvent | TouchEvent) => void;

/**
 * Class for handling drag events in a UI.
 */
export class DragMethod {
  private readonly key?: string;
  private readonly cache: CacheState = { pageX: 0, pageY: 0, dragging: false };

  private readonly onMouseMove: MouseEventHandler;
  private readonly onMouseUp: MouseEventHandler;
  public readonly onMouseDown: MouseEventHandler;
  public readonly onTouchStart: MouseEventHandler;
  public onMove?: OnMove;
  public onMoveEnd?: OnMoveEnd;

  constructor({ key = '', onMove, onMoveEnd }: DragMethodProps = {}) {
    this.key = key;
    this.onMouseDown = this._onMouseDown.bind(this);
    this.onTouchStart = this._onMouseDown.bind(this);
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
    this.onMove = onMove;
    this.onMoveEnd = onMoveEnd;
  }

  private _onMouseMove(e: MouseEvent | TouchEvent): void {
    if (typeof this.onMove !== 'function') {
      return;
    }

    e.preventDefault();

    const pageX = 'pageX' in e ? e.pageX : e.touches[0]?.pageX ?? 0;
    const pageY = 'pageY' in e ? e.pageY : e.touches[0]?.pageY ?? 0;

    this.onMove({
      offsetX: pageX - this.cache.pageX,
      offsetY: pageY - this.cache.pageY,
      pageX,
      pageY,
      startX: this.cache.pageX,
      startY: this.cache.pageY,
      key: this.key,
    });
    this.cache.pageX = pageX;
    this.cache.pageY = pageY;
  }

  private clearListener(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchend', this.onMouseUp);
  }

  private _onMouseUp(): void {
    this.clearListener();
    this.cache.dragging = false;
    if (typeof this.onMoveEnd === 'function') {
      this.onMoveEnd();
    }
  }

  private _onMouseDown(e: MouseEvent | TouchEvent): void {
    e.preventDefault();

    if (typeof this.onMove !== 'function' || this.cache.dragging) {
      return;
    }
    this.clearListener();
    const pageX = 'pageX' in e ? e.pageX : e.touches[0]?.pageX ?? 0;
    const pageY = 'pageY' in e ? e.pageY : e.touches[0]?.pageY ?? 0;

    this.cache.dragging = true;
    this.cache.pageX = pageX;
    this.cache.pageY = pageY;

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onMouseMove, { passive: false });
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchend', this.onMouseUp, { passive: false });
  }
}

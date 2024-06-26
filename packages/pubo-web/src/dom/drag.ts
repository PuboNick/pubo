type OnMove = (n: {
  offsetX: number;
  offsetY: number;
  key?: string;
  pageX: number;
  pageY: number;
  startX: number;
  startY: number;
}) => void;
type OnMoveEnd = () => void;

interface DragMethodProps {
  key?: string;
  /**
   * Tracks the movement of the drag and triggers the onMove callback.
   * @callback OnMove
   * @param {object} options - The options object.
   * @param {number} options.offsetX - The X offset of the drag.
   * @param {number} options.offsetY - The Y offset of the drag.
   * @param {number} options.pageX - The X coordinate of the drag.
   * @param {number} options.pageY - The Y coordinate of the drag.
   * @param {number} options.startX - The initial X coordinate of the drag.
   * @param {number} options.startY - The initial Y coordinate of the drag.
   * @param {string} options.key - The key associated with the drag.
   */
  onMove?: OnMove;
  /**
   * Ends the drag event and triggers the onMoveEnd callback.
   * @callback OnMoveEnd
   */
  onMoveEnd?: OnMoveEnd;
}

/**
 * Class for handling drag events in a UI.
 */

export class DragMethod {
  private readonly key?: string = '';
  private readonly cache = { pageX: 0, pageY: 0, dragging: false };

  private readonly onMouseMove;
  private readonly onMouseUp;
  public readonly onMouseDown;
  public readonly onTouchStart;
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

  private _onMouseMove(e: any) {
    if (typeof this.onMove !== 'function') {
      return;
    }

    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    const pageX = e.pageX ?? e.touches[0]?.pageX;
    const pageY = e.pageY ?? e.touches[0]?.pageY;

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

  private clearListener() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchend', this.onMouseUp);
  }

  private _onMouseUp() {
    this.clearListener();
    this.cache.dragging = false;
    if (typeof this.onMoveEnd === 'function') {
      this.onMoveEnd();
    }
  }

  private _onMouseDown(e: any) {
    if (e.preventDefault && e.pageX) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
    if (typeof this.onMove !== 'function' || this.cache.dragging) {
      return;
    }
    this.clearListener();
    const pageX = e.pageX ?? e.touches[0]?.pageX;
    const pageY = e.pageY ?? e.touches[0]?.pageY;

    this.cache.dragging = true;
    this.cache.pageX = pageX;
    this.cache.pageY = pageY;

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onMouseMove, { passive: false });
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchend', this.onMouseUp, { passive: false });
  }
}
